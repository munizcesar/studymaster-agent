#!/usr/bin/env python3
"""Cloudflare token helper for local development.

Use this script to verify a Cloudflare API token, load credentials from a local .env file,
and run a command with the token set in the environment.
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

import requests


def load_env_file(path: Path):
    values = {}
    if not path.exists():
        return values

    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def verify_token(token: str):
    url = "https://api.cloudflare.com/client/v4/user/tokens/verify"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers, timeout=15)
    return resp.status_code, resp.json()


def parse_args():
    parser = argparse.ArgumentParser(
        description="Cloudflare secure token helper for local development"
    )
    parser.add_argument(
        "--account-id",
        help="Cloudflare Account ID (or use CLOUDFLARE_ACCOUNT_ID from env or .env file)"
    )
    parser.add_argument(
        "--token",
        help="Cloudflare API Token (or use CLOUDFLARE_API_TOKEN from env or .env file)"
    )
    parser.add_argument(
        "--env-file",
        default=".env",
        help="Load credentials from a local .env file"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify the Cloudflare API token with the access token verify endpoint"
    )
    parser.add_argument(
        "--run-cmd",
        help="Run a command with CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN set in the environment"
    )
    parser.add_argument(
        "--print-env",
        action="store_true",
        help="Print secure local export commands for the current token"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    env_values = load_env_file(Path(args.env_file))

    account_id = args.account_id or os.environ.get("CLOUDFLARE_ACCOUNT_ID") or env_values.get("CLOUDFLARE_ACCOUNT_ID")
    token = args.token or os.environ.get("CLOUDFLARE_API_TOKEN") or env_values.get("CLOUDFLARE_API_TOKEN")

    if args.print_env:
        if not account_id or not token:
            print("Missing account id or token to print env commands.")
            sys.exit(1)
        print("# Use these commands in a local shell only")
        print(f"$env:CLOUDFLARE_ACCOUNT_ID=\"{account_id}\"")
        print(f"$env:CLOUDFLARE_API_TOKEN=\"{token}\"")
        sys.exit(0)

    if args.check:
        if not token:
            print("Error: no token found. Provide --token or set CLOUDFLARE_API_TOKEN.")
            sys.exit(1)
        status_code, data = verify_token(token)
        print(f"Cloudflare token verify status: {status_code}")
        print(data)
        sys.exit(0 if status_code == 200 and data.get("success") else 1)

    if args.run_cmd:
        if not account_id or not token:
            print("Error: account id and token are required to run a command.")
            sys.exit(1)
        env = os.environ.copy()
        env["CLOUDFLARE_ACCOUNT_ID"] = account_id
        env["CLOUDFLARE_API_TOKEN"] = token
        print(f"Running command with local Cloudflare credentials: {args.run_cmd}")
        return subprocess.call(args.run_cmd, shell=True, env=env)

    print("No action requested. Use --check, --print-env, or --run-cmd.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
