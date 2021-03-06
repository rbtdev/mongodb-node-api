const passport = require('passport');
const { Users } = require('./models');

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
    let err = null;
    let user = null;
    try {
        user = await Users.findById(id);
    }
    catch (_err) {
        err = _err
    };
    return done(err, user);
});

module.exports.isLoggedIn = (req, res, next) => {
    if (req.user) {
        console.log('authenticated route authorized');
        return next();
    } else {
        return res.jsonApi([401, 'not authorized'])
    }
}

module.exports.authenticate = async (email, password, done) => {
    try {
        let { user, isAuth } = await Users.authenticate(email, password);
        if (!user) return done(null, null, false);
        if (!isAuth) return done(null, user, false);
        return done(null, user, true);
    }
    catch (err) {
        return done(err);
    }
}

module.exports.authorize = (rules) => {
    return (req, res, next) => {
        try {
            // If any rule passes, allow through
            let isAuth = rules.some(rule => {
                return rule(req);
            });

            // If a rule passed allow request through
            if (isAuth) return next();

            // If all rules fails, reject route
            else return next([401, 'not authorized']);
        }
        // If an error occurs reject with error
        catch (err) {
            return next([500, 'error in route authorization']);
        }
    }
}