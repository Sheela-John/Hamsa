var fs = require('fs');

async function generatePrescriptionPdf(medicationData){
    var fonts = {
        'Roboto': {
            normal: 'util/pdf/fonts/Roboto-Regular.ttf',
            bold: 'util/pdf/fonts/Roboto-Medium.ttf',
            italics: 'util/pdf/fonts/Roboto-Italic.ttf',
            bolditalics: 'util/pdf/fonts/Roboto-MediumItalic.ttf',
        },
        'Times':{
            normal:'util/pdf/fonts/times-new-roman.ttf'
        }
    };
    var PdfPrinter = require('pdfmake');
    var printer = new PdfPrinter(fonts);
    var intakeSession = [];
    var date = medicationData[0].consultationUserTime.toISOString().slice(0, 10); 

    medicationData[0].medications.forEach((medication,index) =>{
        index += 1;
        medication['serialNo'] = index;
        var totalIntakeSessions = [
            {"session" : "M", "intake" : "0"},
            {"session" : "A", "intake" : "0"},
            {"session" : "E", "intake" : "0"},
            {"session" : "N", "intake" : "0"},
        ];
        totalIntakeSessions.forEach(intake =>{
            medication.intakeSession.forEach(intakeSession=>{
                if(intakeSession.session == intake.session){
                    intake.intake = intakeSession.intake;
                }
            })
        })
        totalIntakeSessions.forEach(intakesession=>{
            intakeSession.push(intakesession.intake+" - "); //Restructructing intake session and time as per our need.
        })
        var lastElement= intakeSession.pop();
        intakeSession.push(lastElement.slice(0, -3)); //Removing ' - ' from the last element in the intakeCheckArray
        medication['restructuredIntakeSession'] = intakeSession;
        intakeSession = [];

        if(medication.intakeTime == 1) medication["intakeTimeText"] = "Before Meal"
        else medication["intakeTimeText"] = "After Meal"
    })

    //Pdf Structure Definition
    var docDefinition = {
        content: [
            {
                columns:[  
                    { text: 'PRESCRIPTION', style: 'header' }
                ]
            },
            {
                columns:[  
                    { text: '\n'}, 
                ]
            },
            {
                columns:[  
                    { text: 'Name: '+medicationData[0].patientName, style: 'subHeading'},
                    { text: date , alignment: 'right', style: 'subHeading'}
                ]
            },
            {
                columns:[  
                    { text: 'DOB: '+medicationData[0].patientDob, style: 'subHeading'},
                ]
            },
            {
                columns:[  
                    { text: '\n'}, 
                ]
            },
            {
                columns:[  
                    { text: "S.NO", style: 'th', width:30 },
                    { text: "NAME", style: 'th', width:200 },
                    { text: "TYPE", style: 'th', width:80 },
                    { text: "DAYS", style: 'th', width:35 },
                    { text: "INTAKE", style: 'th', width:115 },
                    { text: "INTAKE TIME", style: 'th', width:100 }
                ]
            },
            
        ],
        styles: {
            header: {
                fontSize: 18,
                alignment: 'center',
                decoration:'underline',
                font:'Times',
                normal:true,
                // margin: [0, 0, 0, 20]
            },
            subHeading:{
                fontSize : 9,
                bold: true
            },
            tableCells: {
                fontSize: 8,
                margin: [0, 10, 0, 0]
            },
            columnAlignment:{
                alignment: 'left',
                fontSize: 7
            },
            notesColumnAlignment:{
                alignment: 'left',
                fontSize: 7,
                margin: [30, 0, 0, 0]
            },
            th:{
                bold: true,
                fontSize: 9,
                margin: [0, 0, 0, 10],
            },
            footer:{
                alignment: 'right',
                fontSize: 9,
                bold: true,

            }
        }
    };
    //Pushing the data for the content in pdf definition
    medicationData[0].medications.forEach(medication =>{ 
        docDefinition.content.push( {
            columns:[
                { text: medication.serialNo+".", style: 'tableCells', width:30},
                { text: medication.medicineName, style: 'tableCells', width:200},
                { text: medication.medicineType, style: 'tableCells', width:80},
                { text: medication.days, style: 'tableCells', width:35 },
                { text: medication.restructuredIntakeSession, style: 'tableCells', width:115 },
                { text: medication.intakeTimeText, style: 'tableCells', width:100 }
            ]
        })
        //pushing prescription notes only if it's present
        if(medication.prescriptionNotes != undefined){
            docDefinition.content.push(
                {
                    columns:[
                        { text: "Notes: ", bold: true, style: 'notesColumnAlignment' ,width:55},
                        { text: medication.prescriptionNotes, style: 'columnAlignment'},
                    ]
                }
            )
        }
    })

    docDefinition.content.push({
        columns:[  
            { text: '\n'},
        ]
    }, {
        columns:[
            {text: "-  "+medicationData[0].doctorName, style: 'footer'}
        ]
    })
    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfName = Date.now()
    var createWriteStream = fs.createWriteStream(pdfName+ ".pdf");
    pdfDoc.pipe(createWriteStream);
    pdfDoc.end();
    return new Promise((resolve, reject)=>{
        createWriteStream.on('finish', function () {
            var pdfData = fs.readFileSync(pdfName + ".pdf");
            // Deleting the file after reading 
            fs.unlink(`${pdfName}.pdf`, (err) => {
                if (err)  return reject(err);
                else return resolve(pdfData);
            })
        })
    })
}

module.exports = {
    generatePrescriptionPdf: generatePrescriptionPdf
}