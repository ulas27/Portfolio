from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import random
import time


def gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a


def mod_inverse(e: int, phi: int) -> Optional[int]:
    def egcd(a: int, b: int) -> tuple[int, int, int]:
        if a == 0:
            return (b, 0, 1)
        g, x1, y1 = egcd(b % a, a)
        return (g, y1 - (b // a) * x1, x1)

    g, x, _ = egcd(e % phi, phi)
    if g != 1:
        return None
    return x % phi


def is_probable_prime(n: int, rng: random.Random, rounds: int = 10) -> bool:
    if n < 2:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0:
        return False

    # n-1 = 2^r * d
    r = 0
    d = n - 1
    while d % 2 == 0:
        r += 1
        d //= 2

    for _ in range(rounds):
        a = rng.randrange(2, n - 1)
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True


def generate_prime(bits: int, rng: random.Random) -> int:
    if bits < 2:
        raise ValueError("bits must be >= 2")
    while True:
        n = rng.getrandbits(bits)
        n |= (1 << (bits - 1)) | 1
        if is_probable_prime(n, rng=rng):
            return n


@dataclass(frozen=True)
class RSAKeypair:
    p: int
    q: int
    N: int
    phi: int
    e: int
    d: int


def generate_rsa_keypair(*, prime_bits: int, seed: int) -> RSAKeypair:
    rng = random.Random(seed)
    p = generate_prime(prime_bits, rng)
    q = generate_prime(prime_bits, rng)
    while q == p:
        q = generate_prime(prime_bits, rng)

    N = p * q
    phi = (p - 1) * (q - 1)

    candidates = [3, 5, 17, 257, 65537]
    valid = [e for e in candidates if e < phi and gcd(e, phi) == 1]
    e = rng.choice(valid) if valid else 3

    d = mod_inverse(e, phi)
    if d is None:
        raise ValueError("failed to compute modular inverse")

    return RSAKeypair(p=p, q=q, N=N, phi=phi, e=e, d=d)


def find_period_classical(a: int, N: int, *, max_r: int) -> Optional[int]:
    for r in range(1, max_r + 1):
        if pow(a, r, N) == 1:
            return r
    return None


@dataclass(frozen=True)
class RSABreakAttempt:
    N: int
    a: int
    period_r: Optional[int]
    factor: Optional[int]
    elapsed_ms: float


def break_rsa_modulus_classical(
    N: int,
    *,
    seed: int,
    max_attempts: int = 25,
    max_period_search: Optional[int] = None,
) -> list[RSABreakAttempt]:
    rng = random.Random(seed)
    attempts: list[RSABreakAttempt] = []
    max_r = max_period_search if max_period_search is not None else min(5000, N)

    for _ in range(max_attempts):
        a = rng.randint(2, N - 2)
        t0 = time.perf_counter()

        g = gcd(a, N)
        if g > 1:
            elapsed_ms = (time.perf_counter() - t0) * 1000.0
            attempts.append(RSABreakAttempt(N=N, a=a, period_r=None, factor=g, elapsed_ms=elapsed_ms))
            break

        r = find_period_classical(a, N, max_r=max_r)
        factor: Optional[int] = None
        if r is not None and r % 2 == 0:
            x = pow(a, r // 2, N)
            if x not in (1, N - 1):
                f1 = gcd(x - 1, N)
                f2 = gcd(x + 1, N)
                if 1 < f1 < N and N % f1 == 0:
                    factor = f1
                elif 1 < f2 < N and N % f2 == 0:
                    factor = f2

        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        attempts.append(RSABreakAttempt(N=N, a=a, period_r=r, factor=factor, elapsed_ms=elapsed_ms))
        if factor is not None:
            break

    return attempts

