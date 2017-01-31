--[[

Lua script to acquire a lock for a domen and message

Usage:
script [key] [value] [maxentries] [curtime] [ttl]

Where:

1. [key] is the locking key
2. [value] is the value to lock
3. [maxentries] defines how many values locked for this locking key
4. [curtime] is Current time in milliseconds
5. [ttl] is lock TTL in milliseconds

Return values:

1. -1: value is already locked
2. -2: too many entries for locking key
3. positive number: expiration time (also used as the locking index)

]]--

local key = KEYS[1];
local value = ARGV[1];
local maxentries = tonumber(ARGV[2]);
local curtime = tonumber(ARGV[3]);
local ttl = tonumber(ARGV[4]);

local expiretime = curtime + ttl;

-- check if we have free slots available
local entries = redis.call("ZCOUNT", key, curtime, "+inf");
if entries >= maxentries then
  return -2;
end;

-- check if we already have a lock set
local score = redis.call("ZSCORE", key, value);
if score and tonumber(score) >= curtime then
  return -1;
end;

-- set the lock
redis.call("ZADD", key, expiretime, value);

-- update lock TTL time
redis.call("PEXPIREAT", key, expiretime);

return expiretime;
