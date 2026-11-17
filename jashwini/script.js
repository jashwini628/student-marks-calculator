
// =================================
// INITIAL DATA
// =================================

let subjects = JSON.parse(
    localStorage.getItem("subjects")
) || ["Java", "Python", "English", "NLP", "SC"];

let students = JSON.parse(
    localStorage.getItem("students")
) || [];

// Save data
function saveData() {
    localStorage.setItem(
        "subjects", JSON.stringify(subjects)
    );

    localStorage.setItem(
        "students", JSON.stringify(students)
    );
}

// =================================
// NAVIGATION
// =================================

function showSection(id) {
    document.querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });

    document.getElementById(id)
        .classList.add("active");

    renderAll();
}

// =================================
// GRADE CALCULATION
// =================================

function calculateStudent(student) {

    let marks = Object.values(student.marks);

    let total = marks.reduce(
        (sum, mark) => sum + Number(mark), 0
    );

    let maximum = subjects.length * 100;

    let percentage = maximum > 0
        ? (total / maximum) * 100
        : 0;

    let passed = subjects.length > 0 &&
        subjects.every(subject =>
            Number(student.marks[subject]) >= 50
        );

    let grade;

    if (!passed) {
        grade = "F";
    }
    else if (percentage >= 90) {
        grade = "A";
    }
    else if (percentage >= 80) {
        grade = "B";
    }
    else if (percentage >= 70) {
        grade = "C";
    }
    else {
        grade = "D";
    }

    return {
        total,
        maximum,
        percentage,
        grade,
        result: passed ? "PASS" : "FAIL"
    };
}

// =================================
// DYNAMIC SUBJECT MARKS FORM
// =================================

function renderMarksFields() {

    let container = document.getElementById(
        "marksFields"
    );

    container.innerHTML = "";

    subjects.forEach(subject => {

        let div = document.createElement("div");

        div.className = "mark-field";

        let label = document.createElement("label");
        label.textContent = subject + " Marks";

        let input = document.createElement("input");

        input.type = "number";
        input.min = "0";
        input.max = "100";
        input.required = true;
        input.id = "mark_" + subjects.indexOf(subject);
        input.placeholder = "Enter " + subject + " marks";

        div.appendChild(label);
        div.appendChild(input);

        container.appendChild(div);
    });
}

// =================================
// ADD / UPDATE STUDENT
// =================================

document.getElementById("studentForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    if (subjects.length === 0) {
        alert("Please add at least one subject.");
        return;
    }

    let id = document.getElementById(
        "studentId"
    ).value.trim();

    let name = document.getElementById(
        "studentName"
    ).value.trim();

    let editIndex = document.getElementById(
        "editIndex"
    ).value;

    let marks = {};

    for (let i = 0; i < subjects.length; i++) {

        let value = document.getElementById(
            "mark_" + i
        ).value;

        let mark = Number(value);

        if (value === "" || !Number.isFinite(mark) ||
            mark < 0 || mark > 100) {

            alert("Enter valid marks between 0 and 100 for " + subjects[i]);
            return;
        }

        marks[subjects[i]] = mark;
    }

    // Prevent duplicate IDs
    let duplicate = students.some((student, index) =>
        student.id.toLowerCase() === id.toLowerCase() &&
        index !== Number(editIndex)
    );

    if (duplicate) {
        alert("Student ID already exists!");
        return;
    }

    let student = {
        id: id,
        name: name,
        marks: marks
    };

    if (editIndex !== "") {

        students[Number(editIndex)] = student;

        alert("Student updated successfully!");

    } else {

        students.push(student);

        alert("Student added successfully!");
    }

    saveData();

    resetForm();
    renderAll();
});

// =================================
// RESET FORM
// =================================

function resetForm() {

    document.getElementById(
        "studentForm"
    ).reset();

    document.getElementById(
        "editIndex"
    ).value = "";

    document.getElementById(
        "saveButton"
    ).textContent = "Add Student";

    renderMarksFields();
}

// =================================
// DISPLAY STUDENTS
// =================================

function renderStudents() {

    renderMarksFields();

    let head = document.getElementById(
        "studentHead"
    );

    let body = document.getElementById(
        "studentBody"
    );

    head.innerHTML = "";
    body.innerHTML = "";

    let headers = [
        "S.No",
        "Student ID",
        "Name",
        ...subjects,
        "Total",
        "Percentage",
        "Grade",
        "Result",
        "Actions"
    ];

    let headerRow = document.createElement("tr");

    headers.forEach(value => {
        let th = document.createElement("th");
        th.textContent = value;
        headerRow.appendChild(th);
    });

    head.appendChild(headerRow);

    let search = document.getElementById(
        "search"
    ).value.toLowerCase();

    let filter = document.getElementById(
        "resultFilter"
    ).value;

    students.forEach((student, index) => {

        let result = calculateStudent(student);

        if (
            !student.name.toLowerCase().includes(search) &&
            !student.id.toLowerCase().includes(search)
        ) return;

        if (filter !== "ALL" &&
            filter !== result.result) return;

        let row = document.createElement("tr");

        let values = [
            index + 1,
            student.id,
            student.name,
            ...subjects.map(subject =>
                student.marks[subject] ?? 0
            ),
            result.total,
            result.percentage.toFixed(2) + "%",
            result.grade,
            result.result
        ];

        values.forEach((value, i) => {

            let td = document.createElement("td");
            td.textContent = value;

            if (i === values.length - 1) {
                td.className = result.result === "PASS"
                    ? "pass" : "fail";
            }

            row.appendChild(td);
        });

        let action = document.createElement("td");

        let edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.className = "edit";
        edit.onclick = () => editStudent(index);

        let del = document.createElement("button");
        del.textContent = "Delete";
        del.className = "delete";
        del.onclick = () => deleteStudent(index);

        action.append(edit, del);
        row.appendChild(action);

        body.appendChild(row);
    });
}

// =================================
// EDIT STUDENT
// =================================

function editStudent(index) {

    let student = students[index];

    document.getElementById(
        "studentId"
    ).value = student.id;

    document.getElementById(
        "studentName"
    ).value = student.name;

    document.getElementById(
        "editIndex"
    ).value = index;

    renderMarksFields();

    subjects.forEach((subject, i) => {

        document.getElementById(
            "mark_" + i
        ).value = student.marks[subject] ?? 0;
    });

    document.getElementById(
        "saveButton"
    ).textContent = "Update Student";

    showSection("students");

    window.scrollTo(0, 0);
}

// =================================
// DELETE STUDENT
// =================================

function deleteStudent(index) {

    if (confirm("Are you sure you want to delete this student?")) {

        students.splice(index, 1);

        saveData();
        renderAll();
    }
}

// =================================
// SUBJECT MANAGEMENT
// =================================

document.getElementById("subjectForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    let name = document.getElementById(
        "subjectName"
    ).value.trim();

    if (!name) return;

    let exists = subjects.some(subject =>
        subject.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        alert("Subject already exists!");
        return;
    }

    subjects.push(name);

    students.forEach(student => {
        student.marks[name] = 0;
    });

    saveData();

    this.reset();

    renderAll();

    alert("Subject added successfully!");
});

// =================================
// DISPLAY SUBJECTS
// =================================

function renderSubjects() {

    let body = document.getElementById(
        "subjectBody"
    );

    body.innerHTML = "";

    subjects.forEach((subject, index) => {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td></td>
        `;

        row.children[1].textContent = subject;

        let action = document.createElement("td");

        let edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.className = "edit";
        edit.onclick = () => editSubject(index);

        let del = document.createElement("button");
        del.textContent = "Delete";
        del.className = "delete";
        del.onclick = () => deleteSubject(index);

        action.append(edit, del);
        row.appendChild(action);

        body.appendChild(row);
    });
}

// =================================
// EDIT SUBJECT
// =================================

function editSubject(index) {

    let oldName = subjects[index];

    let newName = prompt(
        "Enter new subject name:",
        oldName
    );

    if (newName === null) return;

    newName = newName.trim();

    if (!newName) {
        alert("Subject name cannot be empty.");
        return;
    }

    if (subjects.some((subject, i) =>
        i !== index &&
        subject.toLowerCase() === newName.toLowerCase()
    )) {
        alert("Subject already exists!");
        return;
    }

    subjects[index] = newName;

    students.forEach(student => {

        student.marks[newName] =
            student.marks[oldName] ?? 0;

        delete student.marks[oldName];
    });

    saveData();
    renderAll();
}

// =================================
// DELETE SUBJECT
// =================================

function deleteSubject(index) {

    if (subjects.length <= 1) {
        alert("At least one subject is required.");
        return;
    }

    let name = subjects[index];

    if (confirm("Delete subject " + name + "?")) {

        subjects.splice(index, 1);

        students.forEach(student => {
            delete student.marks[name];
        });

        saveData();
        renderAll();
    }
}

// =================================
// DASHBOARD
// =================================

function renderDashboard() {

    let passed = 0;
    let failed = 0;

    students.forEach(student => {

        let result = calculateStudent(student);

        if (result.result === "PASS") {
            passed++;
        } else {
            failed++;
        }
    });

    document.getElementById(
        "totalStudents"
    ).textContent = students.length;

    document.getElementById(
        "totalSubjects"
    ).textContent = subjects.length;

    document.getElementById(
        "passedStudents"
    ).textContent = passed;

    document.getElementById(
        "failedStudents"
    ).textContent = failed;
}

// =================================
// REPORTS
// =================================

function renderReports() {

    let body = document.getElementById(
        "reportBody"
    );

    body.innerHTML = "";

    students.forEach(student => {

        let data = calculateStudent(student);

        let row = document.createElement("tr");

        let values = [
            student.name,
            data.total,
            data.percentage.toFixed(2) + "%",
            data.grade,
            data.result
        ];

        values.forEach((value, index) => {

            let td = document.createElement("td");

            td.textContent = value;

            if (index === 4) {
                td.className = data.result === "PASS"
                    ? "pass" : "fail";
            }

            row.appendChild(td);
        });

        body.appendChild(row);
    });
}

// =================================
// EXPORT CSV
// =================================

function exportCSV() {

    let headers = [
        "S.No",
        "Student ID",
        "Name",
        ...subjects,
        "Total Marks",
        "Percentage",
        "Grade",
        "Result"
    ];

    let rows = [headers];

    students.forEach((student, index) => {

        let data = calculateStudent(student);

        rows.push([
            index + 1,
            student.id,
            student.name,
            ...subjects.map(subject =>
                student.marks[subject] ?? 0
            ),
            data.total,
            data.percentage.toFixed(2),
            data.grade,
            data.result
        ]);
    });

    let csv = rows.map(row =>
        row.map(value =>
            '"' + String(value).replace(/"/g, '""') + '"'
        ).join(",")
    ).join("\n");

    let blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    let url = URL.createObjectURL(blob);

    let link = document.createElement("a");

    link.href = url;
    link.download = "student-report.csv";
    link.click();

    URL.revokeObjectURL(url);
}

// =================================
// RENDER EVERYTHING
// =================================

function renderAll() {

    renderStudents();
    renderSubjects();
    renderDashboard();
    renderReports();
}

// =================================
// FIRST LOAD
// =================================

renderAll();
