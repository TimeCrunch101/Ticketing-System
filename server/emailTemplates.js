let newTicketEmail = `
<h1>A new Ticket has been added, login to view!</h1>
`

let NotFound = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Not Found</title>
</head>
<body>
    <div>
        <img src="https://api.time.com/wp-content/uploads/2015/05/404-errors26.jpg" alt="">
    </div>
</body>
<style>
    body {
        background-color: black;
    }
    div {
        width: fit-content;
        margin: 5em auto;
    }
    img {
        border-radius: 1em;
        width: 700px;
        height: 500px;
    }
</style>
</html>
`


module.exports = {
    newTicketEmail: newTicketEmail,
    NotFound: NotFound
}