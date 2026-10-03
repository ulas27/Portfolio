from __future__ import annotations

def run_bb84() -> None:
    from experiments.exp_bb84 import main as bb84_main

    bb84_main()


def run_grover() -> None:
    from experiments.exp_grover import main as grover_main

    grover_main()


def run_shor15() -> None:
    from experiments.exp_shor15 import main as shor_main

    shor_main()


def run_kyber() -> None:
    from experiments.exp_kyber import main as kyber_main

    kyber_main()


def main() -> None:
    run_bb84()
    run_grover()
    run_shor15()
    run_kyber()
    print("Finished all experiments.")


if __name__ == "__main__":
    main()

