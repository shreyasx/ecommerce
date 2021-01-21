import React from "react";
import { isAuthenticated } from "../auth/helper";
import Base from "../core/Base";

const Verify = () => {
	return (
		<Base title="Account Verification Page" description="">
			<h2 className="text-white">{`An email has been sent to ${
				isAuthenticated().user.email
			}, follow the link mentioned to verify your account.`}</h2>
		</Base>
	);
};

export default Verify;
