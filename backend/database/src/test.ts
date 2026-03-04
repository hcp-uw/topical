import { authLogIn, authSignOut, authSignUp } from "./auth.ts";
import { dbInsertTopic, dbGetN } from "./db.ts";

// dbInsertTopic("test title 1", "og title 1", "vash", "* bullet \n* bullet 2\n* bullet 3", "https://www.researchpaper.com", "Computer Science", "2026-02-11")
// dbInsertTopic("test title 2", "og title 2", "joe", "* bullet \n* bullet 2\n* bullet 3", "https://www.researchpaper.com", "Biology", "2026-02-11")

const all = await dbGetN("77a2c783-6cf9-4785-8957-2a532263f641", 10)

console.log("All results: \n" + JSON.stringify(all) + "\n")

// should be tested manually w/ frontend, currently gives email not confirmed error since this is not a real email
// authSignUp("hcp@uw.edu", "1234567", "Husky", "CP")
// authLogIn("hcp@uw.edu", "1234567")
// authSignOut()