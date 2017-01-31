--[[

Lua script to update existing lock

Usage:
script [key] [value] [curtime] [lastexpiretime] [ttl]

Where:

1. [key] is the locking key
2. [value] is the value to lock
3. [curtime] is Current time in milliseconds
4. [lastexpiretime] The value returned by last update (or acquire)
5. [ttl] is lock TTL in milliseconds

Return values:

1. -1: lock does not exist
2. positive number: expiration time (also used as the locking index)

]]--

local key = KEYS[1];
local value = ARGV[1];
local curtime = tonumber(ARGV[2]);
local lastexpiretime = tonumber(ARGV[3]);
local ttl = tonumber(ARGV[4]);

local expiretime = curtime + ttl;

local score = redis.call("ZSCORE", key, value);
if score and tonumber(score) == lastexpiretime then
    redis.call("ZADD", key, expiretime, value);
    redis.call("PEXPIREAT", key, expiretime);
    return expiretime;
end;
return -1;
