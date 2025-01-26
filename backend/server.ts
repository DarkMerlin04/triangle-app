//--------------Custom Error Classes--------------------
class InputValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InputValidationError";
    }
}

class TriangleValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TriangleValidationError";
    }
}
//------------------------------------------------------

// ตรวจสอบการรับข้อมูล
const checkInvalidData = (value: number) => {
    const regex = /^\d+(\.\d{1,2})?$/; //กำหนดรูปแบบของของ Input ว่าเป็นจำนวนจริงบวกและ ทศนิยมไม่เกิน 2 ตำแหน่ง
    if (!(typeof value === "number" && value > 0 && regex.test(value.toString()))) {
        throw new InputValidationError("ด้านทั้ง 3 ของสามเหลี่ยมต้องเป็นจำนวนจริงบวกและ ทศนิยมไม่เกิน 2 ตำแหน่งเท่านั้น");
    }
};

// ตรวจสอบว่าเป็นสามเหลี่ยมหรือไม่
const checkIsValidTriangle = (A: number, B: number, C: number) => {
    if (!(A + B > C && A + C > B && B + C > A)) {
        throw new TriangleValidationError("ด้านทั้ง 3 ของสามเหลี่ยมไม่สามารถนำมาประกอบเป็นสามเหลี่ยมได้");
    }
};

// ตรวจสอบประเภทของสามเหลี่ยม
const classification = (A: number, B: number, C: number) => {
    if (A === B && B === C) {
        return "Equilateral Triangle";
    } else if (A === B || B === C || A === C) {
        return "Isosceles Triangle";
    } else if (
        A ** 2 + B ** 2 === C ** 2 ||
        A ** 2 + C ** 2 === B ** 2 ||
        B ** 2 + C ** 2 === A ** 2
    ) {
        return "Right Triangle";
    } else {
        return "Scalene Triangle";
    }
}

// คำนวณเส้นรอบรูป
const calculatePerimeter = (A: number, B: number, C: number) => {
    return A + B + C;
}

// คำนวณพื้นที่
const calculateArea = (A: number, B: number, C: number) => {
    const type = classification(A, B, C);
    if (type === "Equilateral Triangle") {
        return (Math.sqrt(3) / 4) * (A ** 2);
    } else {
        const s = calculatePerimeter(A, B, C) / 2;
        return Math.sqrt(s * (s - A) * (s - B) * (s - C));
    }
}

// คำนวณเส้นรอบรูปและ พื้นที่
const calculation  = (A: number, B: number, C: number) => {
    return {
        perimeter: parseFloat(calculatePerimeter(A, B, C).toFixed(2)),
        area: parseFloat(calculateArea(A, B, C).toFixed(2))
    };
}

const server = Bun.serve({
    port: 3000,
    fetch: async (req) => {
        const url = new URL(req.url);
        if (url.pathname === "/triangle" && req.method === "POST") {
            try {
                const { A, B, C } = await req.json();

                checkInvalidData(A);
                checkInvalidData(B);
                checkInvalidData(C);
 
                checkIsValidTriangle(A, B, C);

                const type = classification(A, B, C);
                const { perimeter, area } = calculation(A, B, C);

                const response = {
                    type,
                    area,
                    perimeter
                };

                return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" } });
            } catch (error) { 
                if (error instanceof InputValidationError) {
                    return new Response(JSON.stringify({ 
                        errorType: "InputValidationError",
                        error: error.message 
                    }), {  
                        status: 400,  
                        headers: { "Content-Type": "application/json" }  
                    });
                } else if (error instanceof TriangleValidationError) {
                    return new Response(JSON.stringify({ 
                        errorType: "TriangleValidationError",
                        error: error.message 
                    }), {  
                        status: 400,  
                        headers: { "Content-Type": "application/json" }  
                    });
                } else if (error instanceof SyntaxError) {
                    return new Response(JSON.stringify({ 
                        errorType: "JSONParseError",
                        error: "Invalid JSON body." 
                    }), { 
                        status: 400, 
                        headers: { "Content-Type": "application/json" } 
                    });
                }
                
                return new Response(JSON.stringify({ 
                    errorType: "UnexpectedError",
                    error: "Unexpected error occurred" 
                }), { 
                    status: 500, 
                    headers: { "Content-Type": "application/json" } 
                });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Listening on http://localhost:3000 ...`);
