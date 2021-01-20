import React, { useState } from "react";

const Purchases = () => {
	const [loading, setloading] = useState(true);
	return loading ? (
		<img
			style={{ width: "200px" }}
			src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Youtube_loading_symbol_1_(wobbly).gif"
			alt="loading"
		/>
	) : (
		<Base title="All Purchases"></Base>
	);
};

export default Purchases;

{
	/* <img
							style={{ width: "200px" }}
							src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Youtube_loading_symbol_1_(wobbly).gif"
							alt="loading"
						/> */
}
