
const { isValidJWT } = require('../utils/utils');
const usersDb = require("../db/users")


const authentication = async (req, res, next) => {

    try {
        const { authorization } = req.headers;

        // If neither authorization nor apikey is provided, return 401 Unauthorized.
        if (!authorization) {
            return res.status(401).send();
        }
        if (authorization) {
            const token = authorization.startsWith("Bearer ")
                ? authorization.slice(7) // cut off "Bearer "
                : authorization;

            const decoded = isValidJWT(token);

            if (!decoded) return res.status(401).send();
            let userCheck = await usersDb.get('id', decoded.id, global.connectionCustomerDB)
            const user = userCheck[0]
           


            if (!user) return res.status(401).send();
            req.user = user;
            next();
        }

    } catch (e) {
        console.log("error", e)
        return res.status(401).send(e.message);
    }
}
module.exports = {
    authentication
}