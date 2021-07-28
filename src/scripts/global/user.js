import fetch from "unfetch";
import { MINUTES_UNTIL_AUTO_LOGOUT } from "./constants";

export const UserServices = {
    setOFUserData: ({ document, documentType, email, firstName, lastName, phone }) => {
        vtexjs.checkout.sendAttachment("clientProfileData", {
            document,
            documentType,
            email,
            firstName,
            lastName,
            phone,
            isCorporate: false,
        });
    },
    validateUser: (success, error) => {
        fetch("/no-cache/profileSystem/getProfile")
            .then((res) => res.json())
            .then(({ IsUserDefined, UserId, Email, FirstName, LastName }) => {
                if (!IsUserDefined) {
                    localStorage.removeItem("userData");
                    error && error();
                } else {
                    !localStorage.getItem("userData") &&
                        localStorage.setItem(
                            "userData",
                            JSON.stringify({
                                userId: UserId,
                                isUserDefined: IsUserDefined,
                                userEmail: Email,
                                firstName: FirstName,
                                lastName: LastName,
                                activeUntil: Date.now() + (60000 * MINUTES_UNTIL_AUTO_LOGOUT),
                            })
                        );
                    success && success(UserId, Email);
                }
            })
            .catch((err) => error && error(err));
    },
    getUserData: () => {
        const userData = localStorage.getItem("userData");

        if (userData) return JSON.parse(userData);
        else return null;
    },
    getUserIdInfo: () => {
        const { userEmail } = JSON.parse(localStorage.getItem("userData"));
        const emailParts = userEmail.split("@")[0].split("-");
        return {id: emailParts[1], idType: emailParts[0]};
    }
};
