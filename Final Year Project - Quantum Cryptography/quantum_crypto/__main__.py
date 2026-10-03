from __future__ import annotations

import argparse
import json
from pathlib import Path

from quantum_crypto.bb84 import sweep_bb84_qber
from quantum_crypto.grover import run_grover_2q
from quantum_crypto.kyber import kem_roundtrip
from quantum_crypto.rsa_break import break_rsa_modulus_classical, generate_rsa_keypair
from quantum_crypto.shor_15 import factor_via_order, run_order_finding_15


def _cmd_bb84(args: argparse.Namespace) -> None:
    sizes = [int(s) for s in args.sizes.split(",") if s.strip()]
    out = sweep_bb84_qber(sizes, trials=args.trials, seed=args.seed, eve=args.eve)
    payload = [
        {"n": n, "mean_qber": mean_qber, "mean_sifted_len": mean_len}
        for (n, mean_qber, mean_len) in out
    ]
    print(json.dumps(payload, indent=2))


def _cmd_grover(args: argparse.Namespace) -> None:
    res = run_grover_2q(target=args.target, iterations=args.iterations, shots=args.shots, seed_simulator=args.seed)
    print(json.dumps(res.__dict__, indent=2))


def _cmd_shor15(args: argparse.Namespace) -> None:
    res = run_order_finding_15(a=args.a, n_count=args.n_count, shots=args.shots, seed_simulator=args.seed)
    factors = None
    if res.inferred_r is not None:
        factors = factor_via_order(res.N, res.a, res.inferred_r)
    payload = {**res.__dict__, "factors": factors}
    print(json.dumps(payload, indent=2))


def _cmd_rsa_break(args: argparse.Namespace) -> None:
    key = generate_rsa_keypair(prime_bits=args.prime_bits, seed=args.seed)
    attempts = break_rsa_modulus_classical(
        key.N,
        seed=args.seed + 1,
        max_attempts=args.max_attempts,
        max_period_search=args.max_period_search,
    )
    payload = {
        "prime_bits": args.prime_bits,
        "N": key.N,
        "e": key.e,
        "attempts": [a.__dict__ for a in attempts],
        "success": attempts[-1].factor is not None,
    }
    print(json.dumps(payload, indent=2))


def _cmd_kyber(args: argparse.Namespace) -> None:
    res = kem_roundtrip(level=args.level)
    print(json.dumps(res.__dict__, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(prog="quantum_crypto", description="Quantum cryptography demos (Qiskit)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_bb84 = sub.add_parser("bb84", help="Run BB84 QBER sweep")
    p_bb84.add_argument("--sizes", default="32,64,128,256", help="Comma-separated key sizes")
    p_bb84.add_argument("--trials", type=int, default=20)
    p_bb84.add_argument("--seed", type=int, default=1234)
    p_bb84.add_argument("--eve", action="store_true", help="Enable intercept-resend eavesdropper")
    p_bb84.set_defaults(func=_cmd_bb84)

    p_grover = sub.add_parser("grover", help="Run 2-qubit Grover demo")
    p_grover.add_argument("--target", default="11", choices=["00", "01", "10", "11"])
    p_grover.add_argument("--iterations", type=int, default=1)
    p_grover.add_argument("--shots", type=int, default=1024)
    p_grover.add_argument("--seed", type=int, default=1234)
    p_grover.set_defaults(func=_cmd_grover)

    p_shor = sub.add_parser("shor15", help="Run Shor order-finding demo for N=15")
    p_shor.add_argument("--a", type=int, default=2, choices=[2, 4, 7, 8, 11, 13, 14])
    p_shor.add_argument("--n-count", type=int, default=8)
    p_shor.add_argument("--shots", type=int, default=2048)
    p_shor.add_argument("--seed", type=int, default=1234)
    p_shor.set_defaults(func=_cmd_shor15)

    p_rsa = sub.add_parser("rsa-break", help="Run small RSA breaking simulation (classical period finding)")
    p_rsa.add_argument("--prime-bits", type=int, default=7)
    p_rsa.add_argument("--max-attempts", type=int, default=25)
    p_rsa.add_argument("--max-period-search", type=int, default=None)
    p_rsa.add_argument("--seed", type=int, default=1234)
    p_rsa.set_defaults(func=_cmd_rsa_break)

    p_kyber = sub.add_parser("kyber", help="Run Kyber KEM roundtrip")
    p_kyber.add_argument("--level", default="kyber512", choices=["kyber512", "kyber768", "kyber1024"])
    p_kyber.set_defaults(func=_cmd_kyber)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

