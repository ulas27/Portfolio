from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from qiskit import QuantumCircuit, transpile
from qiskit_aer import Aer


@dataclass(frozen=True)
class OrderFindingResult:
    N: int
    a: int
    n_count: int
    shots: int
    counts: dict[str, int]
    inferred_r: Optional[int]


def _c_amod15(a: int, power: int) -> QuantumCircuit:
    """Controlled modular multiplication by a^power mod 15 for a in {2,4,7,8,11,13,14}.

    This is a standard small-N educational construction: the work register is 4 qubits
    encoding values 0..15. For N=15, multiplication by a mod 15 is a permutation, so it
    can be implemented using SWAP/X patterns.
    """
    if a not in {2, 4, 7, 8, 11, 13, 14}:
        raise ValueError("a must be one of {2,4,7,8,11,13,14} for N=15 demo")

    qc = QuantumCircuit(4)
    for _ in range(power):
        if a in {2, 13}:
            qc.swap(2, 3)
            qc.swap(1, 2)
            qc.swap(0, 1)
        if a in {7, 8}:
            qc.swap(0, 1)
            qc.swap(1, 2)
            qc.swap(2, 3)
        if a in {4, 11}:
            qc.swap(1, 3)
            qc.swap(0, 2)
        if a in {7, 11, 13}:
            qc.x([0, 1, 2, 3])

    gate = qc.to_gate()
    gate.name = f"{a}^{power} mod 15"
    cgate = gate.control()
    return cgate


def _iqft(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    for j in range(n // 2):
        qc.swap(j, n - j - 1)
    for j in range(n):
        for m in range(j):
            qc.cp(-3.141592653589793 / float(2 ** (j - m)), m, j)
        qc.h(j)
    qc.name = "iQFT"
    return qc


def _infer_order_from_phase_bits(bits: str, *, a: int, N: int) -> Optional[int]:
    """Infer r from a measured phase using continued fraction for N=15 demo."""
    # Convert bitstring (msb..lsb) to phase in [0,1)
    phase = int(bits, 2) / (2 ** len(bits))
    if phase == 0:
        return None

    # Continued fraction expansion with a small depth cap is enough for N=15
    from fractions import Fraction

    frac = Fraction(phase).limit_denominator(N)
    r = frac.denominator
    if pow(a, r, N) == 1:
        return r
    return None


def run_order_finding_15(
    *,
    a: int = 2,
    n_count: int = 8,
    shots: int = 2048,
    seed_simulator: Optional[int] = 1234,
) -> OrderFindingResult:
    """Quantum order-finding for N=15 using phase estimation style circuit."""
    N = 15
    if n_count <= 0:
        raise ValueError("n_count must be positive")
    if shots <= 0:
        raise ValueError("shots must be positive")

    qc = QuantumCircuit(n_count + 4, n_count)

    # Counting register in superposition
    for q in range(n_count):
        qc.h(q)

    # Work register initialised to |1>
    qc.x(n_count + 0)

    # Controlled-U^{2^j}
    for q in range(n_count):
        power = 2**q
        qc.append(_c_amod15(a, power), [q] + [n_count + i for i in range(4)])

    qc.compose(_iqft(n_count), inplace=True, qubits=list(range(n_count)))
    qc.measure(list(range(n_count)), list(range(n_count)))

    backend = Aer.get_backend("aer_simulator")
    tqc = transpile(qc, backend)
    result = backend.run(tqc, shots=shots, seed_simulator=seed_simulator).result()
    counts = result.get_counts()

    # Try to infer r from the most frequent non-zero outcome
    sorted_counts = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
    inferred: Optional[int] = None
    for bitstr, _ in sorted_counts:
        if bitstr != "0" * n_count:
            inferred = _infer_order_from_phase_bits(bitstr, a=a, N=N)
            if inferred is not None:
                break

    return OrderFindingResult(N=N, a=a, n_count=n_count, shots=shots, counts=counts, inferred_r=inferred)


def factor_via_order(N: int, a: int, r: int) -> Optional[tuple[int, int]]:
    """Extract factors from order r when conditions hold."""
    if r % 2 != 0:
        return None
    x = pow(a, r // 2, N)
    if x in (1, N - 1):
        return None
    import math

    p = math.gcd(x - 1, N)
    q = math.gcd(x + 1, N)
    if 1 < p < N and N % p == 0:
        return (p, N // p)
    if 1 < q < N and N % q == 0:
        return (q, N // q)
    return None

