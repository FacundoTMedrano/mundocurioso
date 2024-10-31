const whiteList = ["http://localhost:5174"];

export const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("not allow by Cors"));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
};
