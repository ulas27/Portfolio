from __future__ import annotations

import json

from quantum_crypto.shor_15 import factor_via_order, run_order_finding_15


def main() -> None:
    res = run_order_finding_15(a=2, n_count=8, shots=4096, seed_simulator=1234)
    factors = None
    if res.inferred_r is not None:
        factors = factor_via_order(res.N, res.a, res.inferred_r)

    payload = {**res.__dict__, "factors": factors}
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
