#! /bin/bash

output=$(nc -z localhost 8545; echo $?)
[ $output -eq "0" ] && ganache_running=true
if [ ! $ganache_running ]; then
  echo "Starting our own ganache node instance"
  node ./node_modules/ganache-cli/build/cli.node.js -i 3 \
  > /dev/null &
  trpc_pid=$!
fi
truffle test "$@"
if [ ! $ganache_running ]; then
  kill -9 $trpc_pid
fi
