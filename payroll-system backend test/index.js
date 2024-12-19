import { json, urlencoded } from "express";
import express from "express";

const app = express();
const port = 3001;

app.use(urlencoded({ extended: true }));
app.use(json());

app.post('/payroll', (req, res) => {
    // get request body
    const workingHours = req.body.working_hours;
    const hourlyRate = req.body.hourly_rate;
    // validate
    if(!workingHours) {
        return res.status(422).send({
            success: false,
            message: "working_hours is required!",
        });
    } else if(!hourlyRate) {
        return res.status(422).send({
            success: false,
            message: "hourly_rate is required!",
        });
    } else if(typeof workingHours !== "number") {
        return res.status(422).send({
            success: false,
            message: "working_hours value must be number!",
        });
    } else if(typeof hourlyRate !== "number") {
        return res.status(422).send({
            success: false,
            message: "hourly_rate value must be number!",
        });
    }
    // number to format rupiah
    function formatRupiah(value) {
        return value.toLocaleString("id-ID", { style: "currency", currency: "IDR"});
    }

    const numberOfWeeksPerMonth = 4;
    const workingHoursPerWeek = workingHours / numberOfWeeksPerMonth;
    const weeklyWorkingHoursLimit = 40;
    let overtimePay = 0;
    const overtimeBonus = 1.5 * hourlyRate;

    if(workingHoursPerWeek > weeklyWorkingHoursLimit) {
        const overtime = workingHoursPerWeek - weeklyWorkingHoursLimit;
        overtimePay = overtime * overtimeBonus;
    }

    const basicSalary = workingHours * hourlyRate;

    return res.status(200).send({
        success: true,
        message: "Your monthly salary",
        salary: {
            basicSalary: formatRupiah(basicSalary),
            overtimePay: overtimePay > 0 ? formatRupiah(overtimePay) : 0,
            total: overtimePay > 0 ? formatRupiah(basicSalary + overtimePay) : formatRupiah(basicSalary),
        }
    });
});


app.listen(port, () => {
    console.log(`application success running at http://localhost:${port}`);
});