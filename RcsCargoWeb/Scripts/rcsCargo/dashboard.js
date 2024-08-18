function initDashboard() {
    //var html = htmlElements.card("Flight Schedules", "aaa", 12);
    //$("#dashboardMain").append(html);
    //$("#flightSchedule").parent().attr("style", "height: 600px");

    var calendarEl = document.getElementById('flightSchedule');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth'
    });
    calendar.render();
}