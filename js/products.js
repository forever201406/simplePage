/**
 * Created by user on 16/1/5.
 */
(function(){
    'use strict';

    var url = window.location.protocol + "//" + window.location.host;

    // the root of your site
    var rootIndex = window.location.pathname.lastIndexOf("/");
    var root = window.location.pathname.substring(0, rootIndex);
    // the path of the search data
    var path = url + root + '/data.json';

    var searchContent = [];
    var searchTags = [];

    $.ajax({
        url: path,
        dataType: "json",
        sync: false,
        cache: false,
        success: function(data){
            var pluginList = document.getElementById("plugin-list");
            var pluginListCount = document.getElementById("plugin-list-count");
            var tpl = '\
                <li class="plugin on">\
                    <div class="plugin-screenshot">\
                        <img src="<%=imgUrl%>" class="plugin-screenshot-img" width="340" height="212">\
                        <a href="<%=url%>" class="plugin-preview-link">\
                            <i class="fa fa-eye"></i>\
                        </a>\
                    </div>\
                    <a href="<%=url%>" class="plugin-name"><%=siteName%></a>\
                    <div class="plugin-tag-list plugin-tag-list-marginTop"><%=pluginTag%></div>\
                </li>';
            var tagTpl = '<div class="plugin-tag"><%=tagName%></div>';
            var tplWord = ["imgUrl","url","siteName", "pluginTag"];
            var sites = data.sites;
            var html = [], tagHtml, i, item, tags, tmpTpl = '', tmpTagTpl = '', regExp;

            pluginListCount.innerText = sites.length + " items";

            for(i = 0;i < sites.length;i++){
                item = sites[i];
                tags = item.tag;
                tmpTpl = tpl;
                tagHtml = [];

                if(tags !== undefined && tags.length !== 0 ){
                    tags.forEach(function(tag){
                        tmpTagTpl = tagTpl;
                        regExp = new RegExp("<%=tagName%>", "g");
                        tmpTagTpl = tmpTagTpl.replace(regExp, tag);
                        tagHtml.push(tmpTagTpl);
                    });
                    searchTags.push(tags.join(","));
                }else{
                    searchTags.push("");
                }

                item.pluginTag = tagHtml.join("");

                searchContent.push(item.siteName);

                tplWord.forEach(function(key){
                    var value = item[key];
                    regExp = new RegExp("<%=" + key + "%>", "g");
                    if(key === "url" && value === ""){
                        value = "#";
                    }
                    tmpTpl = tmpTpl.replace(regExp, value);
                });
                html.push(tmpTpl);
            }

            pluginList.innerHTML = html.join("");

            searchFunc(searchContent, searchTags);

        },
        error: function(e){
            console.log("获取数据失败");
        }
    })
})();

function searchFunc(searchContents, searchTags){
    'use strict';

    var elements = document.getElementsByClassName('plugin');
    var $count = document.getElementById('plugin-list-count');
    var $input = document.getElementById('plugin-search-input');
    var $select = document.getElementById('tag-select');
    var elementLen = elements.length;

    function updateCount(count){
        $count.innerHTML = count + (count === 1 ? ' item' : ' items');
    }

    function addClass(elem, className){
        var classList = elem.classList;

        if (!classList.contains(className)){
            classList.add(className);
        }
    }

    function removeClass(elem, className){
        var classList = elem.classList;

        if (classList.contains(className)){
            classList.remove(className);
        }
    }

    function search(tag, value){
        var result = [];
        var len = 0;
        var i;

        searchContents.forEach(function(content, index){
            var resultIndex = content.toLowerCase().indexOf(value);
            var tagResultIndex = searchTags[index].toLowerCase().indexOf(tag);

            if(resultIndex !== -1 && (tagResultIndex !== -1 || tag === '全部')){
                result.push(true);
                len++;
            }else{
                result.push(false);
            }
        });

        for (i = 0; i < elementLen; i++){
            if (result[i]){
                addClass(elements[i], 'on');
            } else {
                removeClass(elements[i], 'on');
            }
        }

        updateCount(len);
    }

    function displayAll(){
        for (var i = 0; i < elementLen; i++){
            addClass(elements[i], 'on');
        }

        updateCount(elements.length);
    }

    $input.addEventListener('input', function(){
        var value = this.value.toLowerCase();
        var selectValue = $select.value;
        if (!value && selectValue==='全部') return displayAll();

        search(selectValue, value);
    });

    $select.addEventListener('change', function(){
        var inputValue = $input.value.toLowerCase();
        if(this.value === '全部' && inputValue === ''){
            return displayAll();
        }

        search(this.value, inputValue);
    });
}