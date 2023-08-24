import logo from './logo.svg';
import { useRef, useState } from 'react';
import './App.css';
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { PromptTemplate } from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";

function App() {
  const urlRef = useRef();
  const questionRef = useRef();
  const [answer,setanswer]=useState("");
  const key= process.env.REACT_APP_OPENAI_API_KEY;
  
  async function generateAnswer(e) {
    // Implement your code to generate an answer here
    // You can use the provided code, but make sure you integrate the necessary libraries and dependencies
    // Replace the code below with your actual logic
    // const answer = "This is a generated answer.";
    e.preventDefault();
    // console.log(key);
    // console.log(urlRef.current.value);
    const url=urlRef.current.value;
    const question=questionRef.current.value;
    const loader = new CheerioWebBaseLoader(
      url
    );
    console.log(url);
    const data = await loader.load();
    // const data = {};
    
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 10,
      });
    
      const splitDocs = await textSplitter.splitDocuments(data);
    
      

      const embeddings = new OpenAIEmbeddings({openAIApiKey:key});
    
      const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
    
      

      const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo",openAIApiKey:key });
      const template = `Use the following pieces of context to answer the question at the end.
      If you don't know the answer, just say that you don't know, don't try to make up an answer.
      Use three sentences maximum and keep the answer as concise as possible.
      Always say "thanks for asking!" at the end of the answer.
      {context}
      Question: {question}
      Helpful Answer:`;

      const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
        prompt: PromptTemplate.fromTemplate(template),
        returnSourceDocuments: true
      });

      const result = await chain.call({
        query: question
      });

      await setanswer(result.text);
      console.log(result.text);


    // return answer;
  }

  

  return (
    <div className="App">
      <div className="container">
      <h1 className="title">InfoProbe</h1>
        <form className="form" onSubmit={generateAnswer}>
          <label htmlFor="url">Enter a Website URL:</label>
          <input type="url" id="url" name="url" ref={urlRef} placeholder="https://example.com" required/>
          <label htmlFor="question">Enter your Question:</label>
          <input type="text" id="question" name="question" ref={questionRef} placeholder="What is...?" required/>
          <button id="submitButton" type="submit" >Submit</button>
        </form> 

        {answer === "" ? <></>:<div className="result">
        <h2>Result:</h2>
        <p><strong>Answer: {answer}</strong></p>
        </div>}
        </div>
      
    </div>
  );
}

export default App;
