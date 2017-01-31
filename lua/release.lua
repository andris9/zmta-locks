--[[

Lua script to release an existing lock

Usage:
script [key] [value] [lastexpiretime]

Where:

1. [key] is the locking key
2. [value] is the value to lock
3. [lastexpiretime] The value returned by last update (or acquire)

Return values:

1. -1: lock does not exist or locked by someone else
2. positive number: locl was released

]]--

local key = KEYS[1];
local value = ARGV[1];
local lastexpiretime = tonumber(ARGV[2]);

local score = redis.call("ZSCORE", key, value);
if score and tonumber(score) == lastexpiretime then
    redis.call("ZREM", key, value);
    return 1;
end;
return -1;
