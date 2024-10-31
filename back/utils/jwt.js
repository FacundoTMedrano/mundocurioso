import jwt from "jsonwebtoken";

export function makeAccess(values, time = "15m") {
    // eslint-disable-next-line no-undef
    return jwt.sign(values, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: time,
    });
}

export function makeRefresh(values, time = "7d") {
    // eslint-disable-next-line no-undef
    return jwt.sign(values, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: time,
    });
}

export function verify(token, secret) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decode) => {
            if (err) {
                reject(err);
            } else {
                resolve(decode);
            }
        });
    });
}

export function verifyReturnData(token, secret) {
    return new Promise((resolve) => {
        jwt.verify(token, secret, (err, decode) => {
            if (err) {
                resolve(null);
            } else {
                resolve(decode);
            }
        });
    });
}
