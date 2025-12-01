import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PUBLIC_URL_BASE = "https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev";
const BUCKET_NAME = "woreda-documents";

// Test different URL formats
const testPaths = [
  // Format 1: With bucket name in path
  `${PUBLIC_URL_BASE}/${BUCKET_NAME}/woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx`,
  
  // Format 2: Without bucket name (direct path)
  `${PUBLIC_URL_BASE}/woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx`,
  
  // Format 3: Test root
  `${PUBLIC_URL_BASE}/`,
  
  // Format 4: Test bucket root
  `${PUBLIC_URL_BASE}/${BUCKET_NAME}/`,
];

async function testUrls() {
  console.log("🧪 Testing different URL formats for public development URL\n");
  console.log(`Base URL: ${PUBLIC_URL_BASE}\n`);

  for (let i = 0; i < testPaths.length; i++) {
    const url = testPaths[i];
    console.log(`Test ${i + 1}: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get("content-type") || "N/A"}`);
      console.log(`   Content-Length: ${response.headers.get("content-length") || "N/A"}`);
      
      if (response.ok) {
        console.log(`   ✅ SUCCESS! This format works!\n`);
      } else if (response.status === 404) {
        console.log(`   ❌ 404 - File not found at this path\n`);
      } else if (response.status === 403) {
        console.log(`   ❌ 403 - Access denied (bucket not public)\n`);
      } else {
        console.log(`   ⚠️  Unexpected status\n`);
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log("\n💡 If all tests fail:");
  console.log("   1. Wait a few minutes - domain activation can take time");
  console.log("   2. Check if files exist in R2 at the exact paths");
  console.log("   3. Verify the bucket name is correct");
  console.log("   4. Try accessing the URL directly in a browser");
}

testUrls();

