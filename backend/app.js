const express = require("express")
const app = express()
const db = require("./db")

require("dotenv").config()
app.use(express.json())


const PORT = process.env.PORT || 3000

app.get("/tarefas",(req,res)=>{
    db.query("SELECT * FROM tarefas",(err,results)=>{
        if(err){return res.status(500).json({message: "Erro na requisição"})};
        res.status(200).json(results)
    })
})

app.delete("/tarefas/:id",(req,res)=>{
    const id = req.params.id
    db.query("DELETE FROM tarefas WHERE id=?",[id],(err,results)=>{
        if(err){return res.status(500).json({message: "Erro ao deletar o usuário"})};
        res.status(200).json(results)
    })
})

app.post("/nova",(req,res)=>{
    const {nomTarefa,status} = req.body
    db.query("INSERT INTO tarefas(nomTarefa,status) VALUES(?,?)",[nomTarefa,status],(err,results)=>{
        if(err){return res.status(500).json({message: "Erro ao adicionar o usuário"})};
        res.status(200).json(results)
    })
})

app.put("/alterar/:id",(req,res)=>{
    const id = req.params.id
    const {nomTarefa,status} = req.body
    db.query("UPDATE tarefas SET nomTarefa=?,status=? WHERE id=?",[nomTarefa,status,id],(err,results)=>{
        if(err){return res.status(500).json({message: "Erro ao modificar o usuário"})};
        res.status(200).json(results)
    })
})

app.patch("/alterar/:id",(req,res)=>{
    const id = req.params.id
    const camposPermitidos = ["nomTarefa", "status"]
    const campos = camposPermitidos.filter((campo) => req.body[campo] !== undefined)

    if(campos.length === 0){
        return res.status(400).json({message: "Informe ao menos um campo para alterar"})
    }

    const valores = campos.map((campo) => req.body[campo])
    const atualizacoes = campos.map((campo) => `${campo}=?`).join(",")

    db.query(`UPDATE tarefas SET ${atualizacoes} WHERE id=?`,[...valores,id],(err,results)=>{
        if(err){return res.status(500).json({message: "Erro ao modificar o usuário"})};
        res.status(200).json(results)
    })
})


app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT} PORT.`)
})






