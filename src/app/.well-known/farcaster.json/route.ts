function withValidProperties(properties: Record<string, undefined | string | string[]>) {
    return Object.fromEntries(
        Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
    );
}

export async function GET() {
    const URL = process.env.NEXT_PUBLIC_URL as string;
    return Response.json({
        "accountAssociation": {
            "header": "eyJmaWQiOjEzNDI0MTgsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhhZDRCM2Q3MUI2YzgwRTkxOGRDZTdDRUFlYzdBMTlkODk1MUE3MzM1In0",
            "payload": "eyJkb21haW4iOiI1MDUwLXNldmVuLnZlcmNlbC5hcHAifQ",
            "signature": "k13zmAxuh7kTUXJqtSimuyHIHJiKvqq7rkOQLmol09gNdOFSjlhyDWeJ2/RJemm6ORWyItiQWKcnGGwpCb8xuhw="
        },
        "baseBuilder": {
            "allowedAddresses": ["0xCa2b01D0552A30F3619b53b2b59aA3d4358f1Fbf"] // add your Base Account address here
        },
        "miniapp": {
            "version": "1",
            "name": "5050 Game",
            "homeUrl": "https://5050-seven.vercel.app/",
            "iconUrl": "https://5050-seven.vercel.app/favicon.ico",
            "imageUrl": "https://5050-seven.vercel.app/5050.png",
            "buttonTitle": "Play 50-50 Game",
            "splashImageUrl": "https://5050-seven.vercel.app/5050.png",
            "splashBackgroundColor": "#000000",
            "webhookUrl": "https://ex.co/api/webhook",
            "subtitle": "Fast, fun, social",
            "description": "CHOOSE ODD OR EVEN • PLACE YOUR BET • LET THE BLOCKCHAIN DECIDE YOUR FATE!",
            "screenshotUrls": [
                "https://5050-seven.vercel.app/ss1.png",
                "https://5050-seven.vercel.app/ss2.png",
                "https://5050-seven.vercel.app/ss3.png"
            ],
            "primaryCategory": "social",
            "tags": ["example", "miniapp", "baseapp"],
            "heroImageUrl": "https://5050-seven.vercel.app/5050.png",
            "tagline": "Play instantly",
            "ogTitle": "5050 Game Mini App",
            "ogDescription": "Challenge friends in real time.",
            "ogImageUrl": "https://5050-seven.vercel.app/5050.png",
            "noindex": true
        }
    }); // see the next step for the manifest_json_object
}