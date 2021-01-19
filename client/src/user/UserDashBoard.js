import React from "react";
import Base from "../core/Base";
import { isAuthenticated } from "../auth/helper";
import { Link } from "react-router-dom";

const UserDashboard = () => {
	return (
		<Base title="UserDashboard Page">
			<h1 className="text-white">
				Hey, {isAuthenticated().user.name}. This is your User-Dashboard.
			</h1>
			<div style={{ margin: "20px", fontSize: "1.3em" }} className="list">
				<ul>
					<li>
						<Link to="/purchases">View all purchases</Link>
					</li>
					<li>
						<Link to="/reset-password">Reset password</Link>
					</li>
					<li>
						<Link to="/update-email">Update your account email</Link>
					</li>
					<li>
						<Link to="/delete-account">Permanently delete your account</Link>
					</li>
					{isAuthenticated().user.verified === false && (
						<li>
							<Link to="/verify">Verify email address</Link>
						</li>
					)}
				</ul>
			</div>
		</Base>
	);
};

export default UserDashboard;
