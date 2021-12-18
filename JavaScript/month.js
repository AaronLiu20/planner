var cal = {
  // (A) PROPERTIES
  mName: ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], // Month Names
  data: null, // Events for the selected period
  sDay: 0, // Current selected day
  sMth: 0, // Current selected month
  sYear: 0, // Current selected year
  sMon: false, // Start the week on Monday instead of Sunday (Sunday is standard)
  militaryTime: false,
  dummyData: 0,

  // TODO:
  // Change the following to firebase instead of localStorage:
  // 1. Initial load of the data. DONE
  // 2. Saving new data. DONE
  // 3. Editing current data. DONE
  // 4. Deleting existing data.
  // 5. Add listener to load data dynamically so we don't need to refresh.

  // TODO (BUGS):
  // 1. Events aren't being loaded on month selection! FIXED
  // 2. Events aren't being loaded on year/month if a doc doesn't alreay exist. FIXED
  // 3. Listeners save in the session resulting in multiple writes/edit. Clear event listeners somehow.
  // ==>  I have no idea how to fix this... 
  //      1. Removing the listener after the event triggers is not working.
  //      2. Limiting to single trigger {once: true} is not working.
  //      3. Remoing the listener inside the listener itself also is not working.

  // Unwrap everything from the body event listener? Just get the data-id and store it in a variable that I can use? Possible scope issues.

  /* Listener code in case I fix the above bug messing everything up...
   // Real Time Listener (Auto Refresh)
            db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).onSnapshot(querySnapshot => {
              // For clarity -- I realize this declaration is not needed
              let eventChanges = querySnapshot.docChanges();

              // For each change in the database, display it.
              eventChanges.forEach(change => {
                if (change.type == 'added') {
                  cal.loadData(sDay);
                  // Add
                } else if (change.type == 'modified') {
                  cal.loadData(sDay);
                  // Remove + Add
                }
                  else if (change.type == 'removed') {
                    // Remove
                  }
              });
            });
  */

  //Try self destructing listener?
  /*
  addBlurListener(element, field) {
    const listenToBlur = (e) => {
        e.target.removeEventListener(e.type, listenToBlur);
        //your stuff
    };
    element.addEventListener('blur', listenToBlur);
  },
  */

  // Or try searching "how to removeeventlistener from anonymous functions"

  /* CURRENT FIREBASE STRUCTURE
  See: loadData() fucntion for efficient (lol?) implementation structure.
  db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(currentDay.toString()).doc(docID).eventName.value;
    Users -> (UID) -> Events -> (mm-yyyy) -> dd -> (UID) -> #DETAILS#
  */

  // (B) DRAW CALENDAR FOR SELECTED MONTH
  list: function () {
    // (B1) BASIC CALCULATIONS - DAYS IN MONTH, START + END DAY
    // Note - Jan is 0 & Dec is 11 in JS.
    // Note - Sun is 0 & Sat is 6
    cal.sMth = parseInt(document.getElementById("cal-mth").value); // Selected month
    cal.sYear = parseInt(document.getElementById("cal-yr").value); // Selected year
    var daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(), // Number of days in selected month
      startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // First day of the month
      endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(); // Last day of the month

    // (B2) Load saved data from Firebase for the currently logged in user.
    for (var i = 1; i <= daysInMth; i++) {
      cal.loadData(i);
    }

    // (B3) DRAWING CALCULATIONS
    // Determine the number of blank squares before start of month
    var squares = [];
    // If the week starts on sunday and it is monday
    if (cal.sMon && startDay != 1) {
      var blanks = startDay == 0 ? 7 : startDay;
      for (var i = 1; i < blanks; i++) {
        squares.push("blank");
      }
    }
    // If the week starts on monday and it is sunday
    if (!cal.sMon && startDay != 0) {
      for (var i = 0; i < startDay; i++) {
        squares.push("blank");
      }
    }

    // Populate the days of the month
    for (var i = 1; i <= daysInMth; i++) {
      squares.push(i);
    }

    // Determine the number of blank squares after end of month
    if (cal.sMon && endDay != 0) {
      var blanks = endDay == 6 ? 1 : 7 - endDay;
      for (var i = 0; i < blanks; i++) {
        squares.push("blank");
      }
    }
    if (!cal.sMon && endDay != 6) {
      var blanks = endDay == 0 ? 6 : 6 - endDay;
      for (var i = 0; i < blanks; i++) {
        squares.push("blank");
      }
    }

    // (B4) DRAW HTML CALENDAR
    // Container
    var container = document.getElementById("cal-container"),
      cTable = document.createElement("table");
    cTable.id = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);

    // First row - Day names
    var cRow = document.createElement("tr"),
      cCell = null,
      days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thurday", "Friday", "Saturday"];
    if (cal.sMon) {
      days.push(days.shift());
    }

    // Create tables (boxes) for first row.
    for (var d of days) {
      cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("head");
    cTable.appendChild(cRow);

    // Days in Month
    var total = squares.length;
    cRow = document.createElement("tr");

    cRow.classList.add("day"); // this is the whole row and can be used for the week view

    // Create table (boxes) for the rest of the days and load saved data.
    for (var i = 0; i < total; i++) {
      Hasdata = false;
      // The td html element is a standard cell within the table
      cCell = document.createElement("td");
      // "Empty" spaces for the beginning/end of the month.
      if (squares[i] == "blank") {
        cCell.classList.add("blank");
      }
      // Build non-empty spaces for the month.
      else {
        cCell.classList.add("td");
        cCell.setAttribute('id', 'td');
        // If the square isn't "blank" (grey square) place day numbers.
        cCell.innerHTML = "<div class='dd' id=" + squares[i] + ">" + squares[i] + "</div>";

        // Event listener for editing spaces.
        cCell.addEventListener("click", function () {
          cal.modifyEvent(this);
        });
      }

      //Appending days (M-S)
      cRow.appendChild(cCell);
      if (i != 0 && (i + 1) % 7 == 0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }
  },

  // Function for adding, deleting, and editing events.
  modifyEvent: function (currentDay) {

    // Display modal for adding/editing event. 
    var modal = document.getElementById("myModal");
    modal.style.display = "flex";

    firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const userID = firebaseUser.uid;
        //console.log(userID, sMth + "-" + sYear + " " + sDay.toString());

        // Grab the clicked day.
        var sDay = currentDay.firstChild.id;
        var sDayString = sDay.toString();

        // Event listener for the entire body so when a specific event is clicked, I can pull the UniqueID of the clicked element for the database.
        document.body.addEventListener('click', function (event) {
          //console.log("Clicked event ID: " + event.target.id);
          //console.log("Need to match: 'evt' or 'td' or " + sDayString);

          // Editing Event
          if (event.target.id == 'evt') {
            // Month Names
            var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            // Grab clicked date (Month Day Year)
            var sMth = cal.sMth + 1;
            var sDay = currentDay.firstChild.id;
            var sYear = cal.sYear;

            // Grab document fields to modify
            var nameDoc = document.getElementById("evt-name");
            var descDoc = document.getElementById("evt-details");
            var sTimeDoc = document.getElementById("sevt-time");
            var eTimeDoc = document.getElementById("devt-time");

            event.stopPropagation();

            let id = event.target.getAttribute('data-id');
            //console.log("Target atty: " + id);

            // Show appropriate buttons for editing.
            const editBtn = document.getElementById('edit');
            const delBtn = document.getElementById("Delete");
            delBtn.style.display = "inline";
            editBtn.style.display = "inline";

            // Pull current event data to display for editing. 
            db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).doc(id).get().then((snapshot) => {
              // Event name for displaying in the title.
              var tempEvent = snapshot.get('eventName');
              
              // Get current DB values.
              nameDoc.value = snapshot.get('eventName');
              descDoc.value = snapshot.get('eventDesc');
              sTimeDoc.value = snapshot.get('sTime');
              eTimeDoc.value = snapshot.get('eTime');

              //console.log("Event name: " + tempEvent);
              var title = document.getElementById("event-title");
              title.innerHTML = "<div> EDIT EVENT: " + tempEvent + "</br>" + mName[parseInt(sMth) - 1] + " " + sDay + " " + sYear, "</div>";

              editBtn.addEventListener("click", (event2) => {

                //event.target.style.display = "none";
                var eventName = nameDoc.value;
                var eventDesc = descDoc.value;
                var sTime = sTimeDoc.value;
                var eTime = eTimeDoc.value;

                db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).doc(id).set({
                  eventName: nameDoc.value,
                  eventDesc: descDoc.value,
                  // Time causing issues if it's not re-set.
                  sTime: sTimeDoc.value,
                  eTime: eTimeDoc.value
                })
                console.log("%cEvent successfully changed", 'color: #00D833', "to: ", '\n' + eventName, eventDesc, '\n' + sTime, eTime);

                // Display updated values
                event.target.innerHTML = eventName + " " + eTime;
                //console.log(eventName, sTime);

                cal.closeModal();
              }, {
                once: true
              })
            })

            // Delete event.
            delBtn.addEventListener("click", (e) => {
              // Delete function call.
              db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).doc(id).delete();
              event.target.style.display = "none";

              console.log("Event %c(" + id + ")", 'color: #FF5733', "successfully deleted.");
              cal.closeModal();
            }, {
              once: true
            })

            // Adding New Event
          } else if (event.target.id == 'td' || event.target.id == sDayString) {
            // Grab current logged in userID to match to the database.
            const userID = firebaseUser.uid;

            event.stopPropagation();

            // Month Names
            var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            // Grab clicked date (Month Day Year)
            var sMth = cal.sMth + 1;
            var sDay = currentDay.firstChild.id;
            var sYear = cal.sYear;

            // Show appropriate buttons for saving.
            const title = document.getElementById("event-title");
            const saveBtn = document.getElementById('Save');
            const modal = document.getElementById("myModal");
            saveBtn.style.display = "inline";

            // Label title.
            title.innerHTML = "<div>ADD EVENT <br>" + mName[parseInt(sMth) - 1] + "</b>" + " " + sDay + " " + sYear, "</div>";

            // Save event.
            saveBtn.addEventListener("click", (event) => {
              var sTime = document.getElementById("sevt-time").value;
              var eTime = document.getElementById("devt-time").value;
              var eventName = document.getElementById("evt-name").value;
              var eventDesc = document.getElementById("evt-details").value;

              db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).add({
                // format is -> nameOfValue: input
                // KEEP NAMING CONSISTENT, THESE VALUES ARE SPECIFICALLY CALLED
                // CURRENT EVENT DETAILS: sTime, eTime, eventName, eventDesc
                // Can easily add more later
                sTime: document.getElementById("sevt-time").value,
                eTime: document.getElementById("devt-time").value,
                eventName: document.getElementById("evt-name").value,
                eventDesc: document.getElementById("evt-details").value,
              });
              console.log("%cDocument successfully written", "color: #00D833", "with the following: ", '\n', +sDay.toString(), mName[parseInt(sMth) - 1], sYear, '\n', sTime, eTime, '\n', eventName, eventDesc);

              //Poor implementation given that if the user clicks the newly made "event" there is no data-id associted so it cannot be editied.*
              // Load the data into the created cell.
              NewCell = document.createElement("div");

              // Edit the text displayed in the event cell.
              // FB doc-id included for pulling the correct doc on click, bad secruity?
              NewCell.innerHTML = "<div class='evt' id='evt' data-id=''>" + eventName + " " + eTime + "</div>";

              // Grab the current day to append to the correct cell.
              document.getElementById(sDay).innerHTML += NewCell.innerHTML;

              // Close modal on button press.
              cal.closeModal();
            }, {
              once: true
            })
            // Close the modal if it's clicked.
          } else if (event.target.id == 'Close') {
            cal.closeModal;
          }
        }, {
          once: true
        });
      }
    })
  },

  // (D) Close event input form and wipe any values left.
  closeModal: function () {
    // Grab elements.
    const modal = document.getElementById('myModal');
    const saveBtn = document.getElementById('Save');
    const delBtn = document.getElementById("Delete");
    const editBtn = document.getElementById("edit");

    // Hide the modal and reset buttons.
    modal.style.display = "none";
    saveBtn.style.display = "none";
    delBtn.style.display = "none";
    editBtn.style.display = "none";

    // Resent input values back to default.
    document.getElementById("evt-name").value = '';
    document.getElementById("evt-details").value = '';
    document.getElementById("sevt-time").value = '00:00';
    document.getElementById("devt-time").value = '23:59';
  },

  ChangeTime: function () {
    //console.log("changed");
    cal.militaryTime = !cal.militaryTime;
    let value = document.getElementById("militaryTime");
    value.value = this.militaryTime ? "MIlitary" : "AM/PM";
    document.getElementById("Close").onclick = function () {
      cal.closeModal();
    };
  },

  // Load the saved data for the currently logged in user, display it on the calendar.
  loadData: function (currentDay) {

    firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        // Display/hide appropriate buttons.
        // These should be moved to a separate listener later, this function is called a lot!
        document.getElementById('loginNav').style.display = 'none';
        document.getElementById('logoutNav').style.display = 'block';

        // Grab current logged in userID to match to the database.
        const userID = firebaseUser.uid;

        //Month Names
        var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Selected month (+1 to account for 0-11 making it 1-12)
        var sMth = cal.sMth + 1;
        // Selected year
        var sYear = cal.sYear;

        //Coll. -> (DOC) -> Coll. -> (DOC) -> Coll. -> (#DOC#) -> #DETAILS#
        //Users -> (UID) -> Events -> (mm-yyyy) -> dd -> (UID) -> #DETAILS#
        db.collection('users').doc(userID)
          .get().then(
            doc => {
              if (doc.exists) {
                db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).get().
                then(doc2 => {
                  if (doc2.exists) {
                    db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(currentDay.toString()).get().then(snapshot => {
                      if (snapshot.docs.length > 0) {
                        snapshot.docs.forEach(doc => {
                          // When saving we will have to use the format (mm-yyyy) to match this query.
                          Hasdata = true;
                          //console.log("Matching Doc ID OK for day " + currentDay + "!");

                          // Load the data into the created cell.
                          NewCell = document.createElement("div");

                          // Edit the text displayed in the event cell.
                          // FB doc-id included for pulling the correct doc on click, bad secruity?
                          NewCell.innerHTML = "<div class='evt' id='evt' data-id='" + doc.id + "'>" + doc.data().eventName + " " + doc.data().eTime + "</div>";

                          // Grab the current day to append to the correct cell.
                          document.getElementById(currentDay).innerHTML += NewCell.innerHTML;
                          console.log("%cEvent loaded", 'color: #00D833', "for '" + mName[parseInt(sMth) - 1], currentDay + "'!");

                        })
                      } else {
                        console.log("%cNo event found", 'color: #FF5733', "for '" + mName[parseInt(sMth) - 1], currentDay + "'!");
                      }
                    })
                    // Dummy data needs to be created in firestore documents or it CANNOT be accessed.
                  } else if (cal.dummyData != 1) {
                    console.log("%cNo events", 'color: #FF5733', "for the month of " + mName[parseInt(sMth) - 1], sYear + ".\nCreating dummy data...");
                    db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).set({
                      name: mName[parseInt(sMth) - 1] + " " + sYear
                    }).then
                    {
                      console.log("%cDummy data successfully created.", 'color: #00D833');
                      cal.dummyData = 1;
                    }
                  }
                })
              } else {
                console.log("%cNo user ID Found!", 'color: #FF5733');
              }
            });
      }
    })

  }
}



// (G) Draw month & year selector
window.addEventListener("load", function () {
  // (G1) Get current date
  var now = new Date(),
    nowMth = now.getMonth(),
    nowYear = parseInt(now.getFullYear());

  // (G2) Append month selector
  var month = document.getElementById("cal-mth");
  for (var i = 0; i < 12; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = cal.mName[i];
    if (i == nowMth) {
      opt.selected = true;
    }
    opt.setAttribute('id', 'option');
    month.appendChild(opt);
  }

  // (G3) Append year selector
  // Set to 10 years range. Change this as you like.
  var year = document.getElementById("cal-yr");
  for (var i = nowYear - 10; i <= nowYear + 10; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = i;
    if (i == nowYear) {
      opt.selected = true;
    }
    opt.setAttribute('id', 'option');
    year.appendChild(opt);
  }

  // (G4) Start/Draw calendar
  //TODO: add a listener to the acutal month/year elements, not the dropdown button itself.
  //DONE --> see below.

  //document.getElementById("cal-yr").addEventListener("click", cal.list);
  //document.getElementById("cal-mth").addEventListener("click", cal.list);

  const yrOpts = document.getElementById('cal-yr');
  const mthOpts = document.getElementById('cal-mth')

  // Listener to load calendar data when a different year is selected.
  yrOpts.addEventListener('change', () => {
    cal.list();
  });
  // Listener to load calendar data when a different month is selected.
  mthOpts.addEventListener('change', () => {
    cal.list();
  });

  // Hide/Show login/logout buttons appropriately.
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      var element = document.getElementById('loginNav');
      element.classList.remove("nav-item");
      element.style.display = 'none';
    } else {
      var element = document.getElementById('logoutNav');
      element.classList.remove("nav-item");
      element.style.display = 'none';
      //location.reload();
    }
  });

  // Show the calendar.
  cal.list();
});

//Notepad popup
var notepadModal = document.getElementById('notepadModal');
var btn = document.getElementById("notepadBtn");
var span = document.getElementById("notepadClose");
var notes = document.getElementById("notepadText");

btn.onclick = function () {
  // Load notes from DB if they exist.
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      db.collection('users').doc(firebaseUser.uid).get().then((snapshot) => {
        // Load saved notes
        var userNotes = snapshot.get('notes');
        //console.log(userNotes);

        // Prevents "undefined" from being displayed if the user has no notes.
        if (userNotes != null) {
          // Set the notes in the DOM
          notes.innerHTML = userNotes;
        }
      })
    }
  })

  // Display modal.
  notepadModal.style.display = "block";
}

// When the user clicks on <span> (x), save the data and close the modal
span.onclick = function () {
  var userNotes = notes.value;

  // Save notes
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      db.collection('users').doc(firebaseUser.uid).update({
        notes: userNotes
      })
    }
  });

  // Close modal
  notepadModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == notepadModal) {
    notepadModal.style.display = "none";
  }
}