const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const credentialsPath = path.join(__dirname, "../config/googleCredentials.json");
const credentials = JSON.parse(fs.readFileSync(credentialsPath));

const { client_secret, client_id, redirect_uris } =
  credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

exports.getAuthUrl = () => {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
};

exports.getToken = async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  return tokens;
};

exports.setCredentials = (tokens) => {
  oAuth2Client.setCredentials(tokens);
};

exports.insertEvent = async (event) => {
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  return await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });
};
