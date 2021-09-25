{
	"translatorID": "9c2d9ae4-266f-4b95-b0ee-4e3e9b299974",
	"label": "DBMovie",
	"creator": "氦客船长<TanGuangZhi@foxmail.com>",
	"target": "https://movie.douban.com/subject/\\d+",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-09-25 05:34:20"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 YOUR_NAME <- TODO
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	// TODO: adjust the logic here
	if (url.includes('/movie.douban.com/')) {
		return "film";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// TODO: adjust the CSS selector
	var rows = doc.querySelectorAll('h2>a.title[href*="/article/"]');
	for (let row of rows) {
		// TODO: check and maybe adjust
		let href = row.href;
		// TODO: check and maybe adjust
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	// 新建item
	let newItem = new Zotero.Item("film");
	let title = doc.querySelector('span[property="v:itemreviewed"]').textContent
	let date = doc.querySelector('span[property="v:initialReleaseDate"]').textContent
	let runTime = doc.querySelector('span[property="v:runtime"]').textContent
	
	let director = ZU.xpathText(doc, '//span/span[contains(text(),"导演")]/following-sibling::span')
	let scriptwriter = ZU.xpathText(doc, '//span/span[contains(text(),"编剧")]/following-sibling::span')
	let starring = ZU.xpathText(doc, '//span/span[contains(text(),"主演")]/following-sibling::span')
	
	let abs = doc.querySelector('span[property="v:summary"]').textContent
	
	let dbScore = doc.querySelector('strong[property="v:average"]').textContent
	let dbScoreNum = doc.querySelector('span[property="v:votes"]').textContent
	
	// 现在的时间
	let nowTime = getNowFormatTime() 
	
	// tags-->类型
	let genreList = doc.querySelectorAll('span[property="v:genre"]')
	for(let temp of genreList){
		temp = temp.textContent
			newItem.tags.push(temp);
	}

	// 豆瓣电影中多编剧之间用/隔开,这里将他们拆分为列表,然后在单独处理
	let scriptwriterList = scriptwriter.split("/")
	for(let temp of scriptwriterList){
			newItem.creators.push(ZU.cleanAuthor(temp,"scriptwriter"));
	}
	
	// 主演同编剧一样
	let starringList = starring.split("/")
		for(let temp of starringList){
			newItem.creators.push(ZU.cleanAuthor(temp,"contributor"));
	}
	
	// 导演同编剧一样
	let directorList = director.split("/")
	for(let temp of directorList){
			newItem.creators.push(ZU.cleanAuthor(temp,"director"));
	}
	
	
	newItem.title = title
	newItem.abstractNote = abs
	newItem.runningTime = runTime
	newItem.date = date
	newItem.extra = dbScore+"分 "+dbScoreNum+"人" + " 📅"+nowTime
	newItem.url = url 
	// newItem.notes.push({note:""})
	newItem.complete();
}

//获取当前日期，格式YYYY-MM-DD
function getNowFormatDay(nowDate) {
	var char = "-";
	if(nowDate == null){
		nowDate = new Date();
	}
	var day = nowDate.getDate();
	var month = nowDate.getMonth() + 1;//注意月份需要+1
	var year = nowDate.getFullYear();
	//补全0，并拼接
	return year + char + completeDate(month) + char +completeDate(day);
}

//获取当前时间，格式YYYY-MM-DD HH:mm:ss
function getNowFormatTime() {
	var nowDate = new Date();
	var colon = ":";
	var h = nowDate.getHours();
	var m = nowDate.getMinutes();
	var s = nowDate.getSeconds();
	//补全0，并拼接
	return getNowFormatDay(nowDate) + " " + completeDate(h) + colon + completeDate(m) + colon + completeDate(s);
}

//补全0
function completeDate(value) {
	return value < 10 ? "0"+value:value;
}


