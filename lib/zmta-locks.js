'use strict';

const redis = require('redis');
const fs = require('fs');
const path = require('path');

const scripts = new Map([
    ['acquire', fs.readFileSync(path.join(__dirname, '..', 'lua', 'acquire.lua'), 'utf-8')],
    ['renew', fs.readFileSync(path.join(__dirname, '..', 'lua', 'renew.lua'), 'utf-8')],
    ['release', fs.readFileSync(path.join(__dirname, '..', 'lua', 'release.lua'), 'utf-8')]
]);

const EXPIRE_TTL = 1 * 60 * 1000;
const AUTO_TTL = 1 * 30 * 1000;

class ZMTALock {
    constructor(locker, zone, domain, key, expires) {
        this.locker = locker;
        this.zone = zone;
        this.domain = domain;
        this.key = key;
        this.expires = expires;

        this.lock = ['lock', this.zone, this.domain].join(':');

        this.auto = false;
        this.released = false;
        this.renewTimer = false;

        this.autoUpdate();
    }

    autoUpdate() {
        this.renewTimer = setTimeout(() => {
            this.renew((err, success) => {
                if (err || success) {
                    return this.autoUpdate();
                }
            });
        }, AUTO_TTL);
        this.renewTimer.unref();
    }

    renew(next) {
        if (this.released) {
            return setImmediate(() => next(null, false));
        }
        this.locker.client.eval([scripts.get('renew'), 1, this.lock, this.key, Date.now(), this.expires, EXPIRE_TTL], (err, expires) => {
            if (this.released) {
                return setImmediate(() => next(null, false));
            }
            if (err) {
                return next(err);
            }
            if (expires <= 0) {
                this.released = true;
                return next(null, false);
            }
            this.expires = expires;
            return next(null, true);
        });
    }

    release(next) {
        if (this.released) {
            return setImmediate(() => next(null, false));
        }
        this.released = true;
        clearTimeout(this.renewTimer);

        this.locker.client.eval([scripts.get('release'), 1, this.lock, this.key, this.expires], (err, expires) => {
            if (err) {
                return next(err);
            }
            if (expires <= 0) {
                return next(null, false);
            }
            this.expires = expires;
            return next(null, true);
        });
    }
}

class ZMTALocks {
    constructor(options) {
        options = options || {};
        this.client = options.client || redis.createClient(options.redis);
    }

    acquire(zone, domain, key, maxConnections, callback) {
        this.client.eval([scripts.get('acquire'), 1, ['lock', zone, domain].join(':'), key, maxConnections || 1, Date.now(), EXPIRE_TTL], (err, expires) => {
            if (err) {
                return callback(err);
            }
            if (expires <= 0) {
                return callback(null, false);
            }
            let lock = new ZMTALock(this, zone, domain, key, expires);

            return callback(null, lock);
        });
    }
}

module.exports = ZMTALocks;
