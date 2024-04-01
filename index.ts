const res = await fetch('http://localstack:4566/_localstack/health')

console.log(await res.json());