import React, { useState } from "react";
import Base from "../core/Base";
import { isAuthenticated } from "../auth/helper";
import { Link, Redirect } from "react-router-dom";
import { API } from "../backend";

const UserDashboard = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [redirect, setRedirect] = useState(false);

	const errorMessage = () => {
		return (
			<div className="row">
				<div className="col-md-6 offset-sm-3 text-left">
					<div
						className="alert alert-danger"
						style={{ display: error ? "" : "none" }}
					>
						{error}
					</div>
				</div>
			</div>
		);
	};

	const loadingMessage = () => {
		return (
			loading && (
				<div className="alert alert-info">
					<h2>Loading...</h2>
				</div>
			)
		);
	};

	const performRedirect = () => {
		if (redirect) return <Redirect to="/verify" />;
	};

	return (
		<Base title="UserDashboard Page">
			{loadingMessage()}
			{errorMessage()}
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
							<Link
								onClick={() => {
									setLoading(true);
									fetch(`${API}/verify/${isAuthenticated().user._id}`, {
										method: "GET",
										headers: {
											Accept: "application/json",
											"Content-Type": "application/json",
											Authorization: `Bearer ${isAuthenticated().token}`,
										},
									})
										.then(R => R.json())
										.then(resp => {
											if (resp.error) {
												setError(resp.error);
												return;
											}
											setRedirect(true);
											setLoading(false);
										})
										.catch(console.log);
								}}
							>
								Verify email address
							</Link>
						</li>
					)}
				</ul>
			</div>
			{performRedirect()}
		</Base>
	);
};

export default UserDashboard;
