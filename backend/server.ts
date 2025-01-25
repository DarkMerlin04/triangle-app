const server = Bun.serve({
    port: 3000,
    fetch: async (req) => {
        const url = new URL(req.url);
        if (url.pathname === "/triangle" && req.method === "POST") {
            try {
                const { A, B, C } = await req.json();

                if (typeof A !== "number" || typeof B !== "number" || typeof C !== "number" || A <= 0 || B <= 0 || C <= 0) {
                    return new Response(JSON.stringify({ error: "Invalid input. All sides must be positive numbers." }), { status: 400, headers: { "Content-Type": "application/json" } });
                }

                if (A + B <= C || A + C <= B || B + C <= A) {
                    return new Response(JSON.stringify({ error: "Invalid triangle. The sum of any two sides must be greater than the third side." }), { status: 400, headers: { "Content-Type": "application/json" } });
                }

                let type;
                if (A === B && B === C) {
                    type = "Equilateral Triangle";
                } else if (A === B || B === C || A === C) {
                    type = "Isosceles Triangle";
                } else if (
                    A ** 2 + B ** 2 === C ** 2 ||
                    A ** 2 + C ** 2 === B ** 2 ||
                    B ** 2 + C ** 2 === A ** 2
                ) {
                    type = "Right Triangle";
                } else {
                    type = "Scalene Triangle";
                }

                const perimeter = A + B + C;
                const s = perimeter / 2;
                const area = Math.sqrt(s * (s - A) * (s - B) * (s - C));

                const response = {
                    type,
                    area: parseFloat(area.toFixed(2)),
                    perimeter: parseFloat(perimeter.toFixed(2))
                };

                return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" } });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Invalid JSON body." }), { status: 400, headers: { "Content-Type": "application/json" } });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Listening on http://localhost:3000 ...`);
