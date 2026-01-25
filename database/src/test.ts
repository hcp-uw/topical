import { dbInsertTopic, dbGetAll, dbGetAuthors, dbGetCategory } from "./db.ts";

dbInsertTopic("test title 1", "vash", "* bullet \n* bullet 2\n* bullet 3", "https://www.researchpaper.com", "Computer Science")
dbInsertTopic("test title 2", "joe", "* bullet \n* bullet 2\n* bullet 3", "https://www.researchpaper.com", "Biology")

const all = await dbGetAll()
const authorSearch = await dbGetAuthors("Vash")
const categorySearch = await dbGetCategory("computer Science")

console.log("All results: \n" + JSON.stringify(all) + "\n")
console.log("Author search results: \n" + JSON.stringify(authorSearch) + "\n")
console.log("Category search results: \n" + JSON.stringify(categorySearch) + "\n")