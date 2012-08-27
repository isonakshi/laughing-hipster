
// Flag saying we are creating a new row versus updating
var creating = false;

// Currently selected group
var current;

// Current page of groups
var groups;

// Index of the currently selected group
var index;

// The invites to the selected group
var invites;

// Source of invites being shown (group, invited, invites)
var invitesSource;

// The members of the selected group
var members;

// Page size limit (ultimately to be a user pref)
var limit = 10;

// Factory for mini messages
var mini;

// The viewing user
var viewer;

// On-view-load initialization
function init() {
    $(".toplevel").show();
    registerHandlers();
    loadViewer();
    mini = new gadgets.MiniMessage();
}

// Load the initial page of groups
function loadInitialGroups() {
    osapi.jive.core.groups.get({
        limit : limit
    }).execute(onLoadGroups);
}

// Load the next page of groups
function loadNextGroups() {
    // TODO - loadNextGroups
}

// Load the previous page of groups
function loadPreviousGroups() {
    // TODO - loadPreviousGroups
}



// Select the specified group and retrieve the entire information
function onGroupDetailsButton() {
    gadgets.log("onGroupDetailsButton(data-index=" + $(this).attr("data-index") + ")");
    creating = false;
    index = $(this).attr("data-index");
    osapi.jive.core.groups.get({
        id : groups[$(this).attr("data-index")].id
    }).execute(onGroupDetailsData);
}


// Trigger a create or update of this group, then reselect the list
function onGroupSaveButton() {
   
    
    gadgets.log("onGroupSaveButton(creating=" + creating + ",group=" + JSON.stringify(group) + ")");
    if (creating) {
        osapi.jive.core.groups.create(
            group
        ).execute(onGroupSaveResponse);
    }
    else {
        group.update().execute(onGroupSaveResponse);
    }
}

// Verify ceate or update completion and reselect
function onGroupSaveResponse(response) {
    gadgets.log("onGroupSaveResponse(" + JSON.stringify(response) + ")");
    if (response.error) {
        if (creating) {
            mini.createDismissibleMessage("Error creating group: " + response.error.message);
        }
        else {
            mini.createDismissibleMessage("Error updating group: " + response.error.message);
        }
        // Stay on the group detail view
    }
    else {
        mini.createTimerMessage("Group '" + response.data.name + "' successfully saved", 5);
        if (creating) {
            loadInitialGroups();
        }
        else {
            groups[index] = response.data;
            showGroups();
        }
    }
}


// Register UI event handlers
function registerHandlers() {
   
    $("#group-save").click(onGroupSaveButton);
    
}

// Show the selected group
function showGroup() {
    gadgets.log("showGroup(" + JSON.stringify(group) + ")");
    if (creating) {
        $("#group-table-title").html("").html("Create New Social Group");
    }
    else if (group.update) {
        $("#group-table-title").html("").html("Update Existing Social Group");
    }
    else {
        $("#group-table-title").html("");
    }
    showGroupSetContentType("group-content-blog", showGroupHasContentType("blog"));
    showGroupSetContentType("group-content-discussions", showGroupHasContentType("discussions"));
    showGroupSetContentType("group-content-documents", showGroupHasContentType("documents"));
    showGroupSetContentType("group-content-projects", showGroupHasContentType("projects"));
    $("#group-description").val(group.description);
    $("#group-display-name").val(group.displayName);
    $("#group-group-type").val(group.groupType);
    $("#group-name").val(group.name);
    $("#group-creator").html("").html(group.creator.name);
    $("#group-creation-date").html("").html(group.creationDate);
    $("#group-id").html("").html(group.id);
    $("#group-modification-date").html("").html(group.modificationDate);
    $("#group-view-count").html("").html(group.viewCount);
    $(".group-detail").attr("disabled", !(group.update || creating));
    $("#group-delete").attr("disabled", !group.destroy);
    $("#invites-button").attr("disabled", !(group.invites && group.invites.get));
    $("#members-button").attr("disabled", !group.members);
    showOnly("group-div");
}



// Show only the specified top level div
function showOnly(name) {
    gadgets.log("showOnly('" + name + "')");
    $(".toplevel").hide();
    $("#" + name).show();
    gadgets.window.adjustHeight();
}

// Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);

