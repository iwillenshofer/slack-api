const express = require("express")
const {default: axios} = require("axios");
const { header } = require("express/lib/request");
const app = express()

app.use(express.json());
app.use(express.urlencoded());

const PORT = 3000;
const UID = "<intra uid>"
const SECRET = "<intra secret>"


async function get_token()  {
	const resp = await axios.post("https://api.intra.42.fr/oauth/token", {
		grant_type: "client_credentials", 
		client_id: UID,
		client_secret: SECRET
	})
	return (resp.data.access_token);
}

async function get_info(token, username) {
	const config = {
		headers:{
			Authorization: "bearer " + token
		}
	  };
	
	try {
		const resp = await axios.get("https://api.intra.42.fr/v2/users/" + username, config)
		info = { 
			status: true,
			login: resp.data.login,
			email: resp.data.email,
			displayname: resp.data.displayname,
			image: resp.data.image,
			location: resp.data.location
		}
		return (info)
	} catch {
		return {
			status: false,
		};
	}
}

app.post("/info", async (req, res) => {
	console.log(req.body);
	const text = req.body.text;
	const resp_url = req.body.response_url;

	if (text) {
		res.json({
			response_type: "in_channel",
			text: `fetching info...`
		})
	}
	token = await get_token();
	data = await get_info(token, text);
	if (data.status == false)
	{
		ret = [{
			type: "section",
			block_id: "section567",
			text: {
				type: "mrkdwn",
				text: `*user not found*`
			}
		}]
	}
	else
	{
		ret = [
			{
			type: "section",
			block_id: "section789",
			fields: [
				{
					type: "mrkdwn",
					text: `*${data.login}*`
				}
			]
		},
		{
			type: "section",
			block_id: "section567",
			accessory: {
				type: "image",
				image_url: data.image?.link,
				alt_text: data.login 
			},
			text: {
				type: "mrkdwn",
				text: `_Full Name:_ *${data.displayname}*\n_Email:_ *${data.email}*\n_Location:_ *${data.location}*`
			}
		}
	];
	}
	axios.post(resp_url, {
		response_type: "in_channel",
		blocks: ret

	})
})


app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
