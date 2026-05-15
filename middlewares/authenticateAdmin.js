
 

const { fetchUserAgainstAdminToken } = require('../authQuery/auth');

const { isValidJWT } = require('../utils/utils');


const authenticationAdmin = async (req, res, next) => {
    console.log("reached there")
    try {

        const { authorization } = req.headers;


        if (!authorization) return res.status(401).send();
        const decoded = isValidJWT(authorization);
        console.log("decoded", decoded.id)



        if (!decoded) return res.status(401).send();

        const user = await fetchUserAgainstAdminToken(decoded.id);

        if (!user) return res.status(401).send();
        req.user = user;
        next();

    } catch (e) {
        console.log("error", e)
        return res.status(401).send(e.message);
    }
}
module.exports = {
    authenticationAdmin
}