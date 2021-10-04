import tomcat from "../src"


const Stream = tomcat.Index.Domain.Data.Stream
jest.setTimeout(20000)
describe("Streams", () => {
    test("firstStream", async () => {
        const myStream = new Stream<string>('paria')
        await myStream.creatStream()
        const id = tomcat.utils.toTimeEx()
        await myStream.write(id, "paria")
        const lastElement = await myStream.getLastElement();
        const count = await myStream.getCount()
        const a = await myStream.getElement(id)
        myStream.play((OBJECT) => {
            console.log(OBJECT);
            return true
        })
        console.log(lastElement);
        console.log(count);
        console.log(a);
    })
})