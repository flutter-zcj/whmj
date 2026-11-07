#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#define DELTA 0x9E3779B9u

static uint32_t *key_words(const unsigned char *k, int n, int *outn)
{
    *outn = n / 4;
    uint32_t *w = malloc(sizeof(uint32_t) * (*outn));
    memcpy(w, k, n);
    return w;
}

static int xxtea_decrypt_buf(uint32_t *v, int n, uint32_t *k, int kn)
{
    uint32_t z, y, sum, e, mx;
    int p, q;

    if (n < 2 || kn < 2) {
        return 0;
    }

    z = v[n - 1];
    y = v[0];
    q = 6 + 52 / n;
    sum = (uint32_t)q * DELTA;

    while (sum != 0) {
        e = (sum >> 2) & 3;
        for (p = n - 1; p > 0; p--) {
            z = v[p - 1];
            mx = (((z >> 5) ^ (y << 2)) + ((y >> 3) ^ (z << 4))) ^ ((sum ^ y) + (k[(p & 3) ^ e] ^ z));
            v[p] -= mx;
            y = v[p];
        }
        z = v[n - 1];
        mx = (((z >> 5) ^ (y << 2)) + ((y >> 3) ^ (z << 4))) ^ ((sum ^ y) + (k[e & 3] ^ z));
        v[0] -= mx;
        y = v[0];
        sum -= DELTA;
    }

    return 1;
}

int main(int argc, char **argv)
{
    if (argc < 5) {
        fprintf(stderr, "usage: %s in out key signlen\n", argv[0]);
        return 1;
    }

    FILE *f = fopen(argv[1], "rb");
    if (!f) { perror("open in"); return 1; }
    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);

    int signlen = atoi(argv[4]);
    long len = size - signlen;
    unsigned char *buf = malloc(len + 8);
    fseek(f, signlen, SEEK_SET);
    if (fread(buf, 1, len, f) != (size_t)len) { return 1; }
    fclose(f);

    long words = len / 4;
    int pad = (int)(len % 4);
    if (pad) {
        memset(buf + len, 0, 4 - pad);
        words += 1;
    }

    int kn = 0;
    unsigned char rawkey[64];
    int rawlen = 0;
    if (strncmp(argv[3], "hex:", 4) == 0) {
        const char *h = argv[3] + 4;
        while (h[0] && h[1] && rawlen < 64) {
            unsigned int byte = 0;
            if (sscanf(h, "%2x", &byte) != 1) break;
            rawkey[rawlen++] = (unsigned char)byte;
            h += 2;
        }
    } else {
        rawlen = (int)strlen(argv[3]);
        memcpy(rawkey, argv[3], rawlen);
    }
    if (rawlen < 16) {
        memset(rawkey + rawlen, 0, 16 - rawlen);
        rawlen = 16;
    }
    uint32_t *k = key_words(rawkey, rawlen, &kn);
    if (!xxtea_decrypt_buf((uint32_t *)buf, (int)words, k, kn)) { return 1; }

    uint32_t real = ((uint32_t *)buf)[words - 1];
    if (real > (uint32_t)(words * 4)) { real = words * 4; }

    FILE *o = fopen(argv[2], "wb");
    fwrite(buf, 1, real, o);
    fclose(o);
    fprintf(stderr, "decrypted %u bytes of %ld (words=%ld)\n", real, len, words);
    return 0;
}
