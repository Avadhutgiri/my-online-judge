FROM alpine:3.17

RUN apk add --no-cache \
    gcc=12.2.1_git20220924-r4 \
    g++=12.2.1_git20220924-r4 \
    libc-dev \
    make \
    musl-dev

CMD ["gcc", "--version"]
