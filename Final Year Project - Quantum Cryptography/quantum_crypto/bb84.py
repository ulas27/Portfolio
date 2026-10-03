from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional

import random


# 0: Z basis, 1: X basis
Basis = int


@dataclass(frozen=True)
class BB84Run:
    n: int
    sifted_key_len: int
    qber: float
    alice_key: str
    bob_key: str


def _rand_bits(rng: random.Random, n: int) -> list[int]:
    return [rng.getrandbits(1) for _ in range(n)]


def _rand_bases(rng: random.Random, n: int) -> list[Basis]:
    return [rng.getrandbits(1) for _ in range(n)]


def _measure_bb84_bit(rng: random.Random, prepared_bit: int, prepared_basis: Basis, measure_basis: Basis) -> int:
    if prepared_basis == measure_basis:
        return prepared_bit
    return rng.getrandbits(1)


def simulate_bb84(
    n: int,
    *,
    seed: Optional[int] = None,
    eve: bool = False,
) -> BB84Run:
    """Simulate BB84 with optional intercept-resend eavesdropper.

    Model:
    - Alice chooses random bits + bases, prepares 1-qubit states.
    - Optional Eve intercepts, measures in a random basis, then resends.
    - Bob measures in a random basis.
    - Alice/Bob publicly compare bases and keep matched positions (sifting).
    - QBER computed on the sifted key.
    """
    if n <= 0:
        raise ValueError("n must be positive")

    rng = random.Random(seed)
    alice_bits = _rand_bits(rng, n)
    alice_bases = _rand_bases(rng, n)
    bob_bases = _rand_bases(rng, n)

    bob_bits: list[int] = []
    if not eve:
        for i in range(n):
            bob_bits.append(_measure_bb84_bit(rng, alice_bits[i], alice_bases[i], bob_bases[i]))
    else:
        eve_bases = _rand_bases(rng, n)
        for i in range(n):
            eve_bit = _measure_bb84_bit(rng, alice_bits[i], alice_bases[i], eve_bases[i])
            bob_bit = _measure_bb84_bit(rng, eve_bit, eve_bases[i], bob_bases[i])
            bob_bits.append(bob_bit)

    sifted_alice: list[int] = []
    sifted_bob: list[int] = []
    for a_bit, a_basis, b_bit, b_basis in zip(alice_bits, alice_bases, bob_bits, bob_bases):
        if a_basis == b_basis:
            sifted_alice.append(a_bit)
            sifted_bob.append(b_bit)

    if not sifted_alice:
        # Extremely unlikely for non-trivial n, but handle cleanly.
        return BB84Run(
            n=n,
            sifted_key_len=0,
            qber=0.0,
            alice_key="",
            bob_key="",
        )

    errors = sum(1 for a, b in zip(sifted_alice, sifted_bob) if a != b)
    qber = errors / len(sifted_alice)

    return BB84Run(
        n=n,
        sifted_key_len=len(sifted_alice),
        qber=qber,
        alice_key="".join(str(b) for b in sifted_alice),
        bob_key="".join(str(b) for b in sifted_bob),
    )


def sweep_bb84_qber(
    sizes: Iterable[int],
    *,
    trials: int = 20,
    seed: Optional[int] = None,
    eve: bool = False,
) -> list[tuple[int, float, float]]:
    """Return (n, mean_qber, mean_sifted_len) for each n."""
    if trials <= 0:
        raise ValueError("trials must be positive")

    rng = random.Random(seed)
    out: list[tuple[int, float, float]] = []
    for n in sizes:
        qbers: list[float] = []
        lens: list[int] = []
        for _ in range(trials):
            run = simulate_bb84(n, seed=rng.getrandbits(32), eve=eve)
            qbers.append(run.qber)
            lens.append(run.sifted_key_len)
        out.append((n, sum(qbers) / len(qbers), sum(lens) / len(lens)))
    return out
