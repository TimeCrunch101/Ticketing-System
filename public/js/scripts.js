

let spinnerWrapper = document.querySelector('.spinner-wrapper');
function editTicket(ticket_id) {
    window.open(`/editTicket${ticket_id}`, 'popup', 'width=1300,height=800');
    return false
}
function AllTickets() {
    loadSpinner()
    window.location = '/Ticket/View/AllTickets'
}
function OpenTickets() {
    loadSpinner()
    window.location = '/Ticket/View/OpenTickets'
}
function MyClosedTickets() {
    loadSpinner()
    window.location = '/Ticket/View/ClosedTickets'
}
function viewUnassignedTickets() {
    loadSpinner()
    window.location = '/Ticket/View/OpenTickets/Unassigned'
}
function needsAttention() {
    loadSpinner()
    window.location = '/Ticket/View/OpenTickets/NeedsAttention'
}
function loadSpinner() {
    spinnerWrapper.style.display = 'block';
}
function localReload() {
    loadSpinner()
    location.reload()
}

async function sendTestTxtMSG() {
    fetch('/sendTestTxtMsg')
    .then((response) => {
        if (response.status === 200) {
            document.getElementById('TestTXTMSGStatus').innerHTML = '<p style="color: green;">The TXT message sent successfully</p>'
        } else {
            document.getElementById('TestTXTMSGStatus').innerHTML = '<p style="color: red;">The TXT message failed to send, check you API configuration</p>'
        }
    }) 
}

function openPopupWindow(url, width, height) {
    PopUpWindowID = window.open(url, `${url}`, `width=${width},height=${height},left=0,top=0,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no`)
};
function openTicketPopup(url, width, height) {
    PopUpWindowID = window.open(url, `${url}`, `width=${width},height=${height},left=0,top=0,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no`)
};

