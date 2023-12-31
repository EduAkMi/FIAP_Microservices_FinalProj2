const express = require("express");
const bcrypt = require("bcrypt");
const gerarToken = require("../utils/gerartoken");
const verificarToken = require("../middleware/verificartoken");
const Conta = require("../models/conta");
const Cliente = require("../models/cliente");
const config = require("../config/settings");

const router = express.Router();

router.get("/getContas", (req, res) => {
    Conta.find()
    .then((result) => {
        res.status(200).send({ output: "ok", payload: result });
    }).catch((erro) => {
        res.status(500).send({ output: `Erro ao processar dados -> ${erro}` });
    });
});

router.get("/getClientes", (req, res) => {
    Cliente.find()
    .then((result) => {
        res.status(200).send({ output: "ok", payload: result });
    }).catch((erro) => {
        res.status(500).send({ output: `Erro ao processar dados -> ${erro}` });
    });
});

router.post("/cadastrar/:id", verificarToken, (req, res) => {
    Cliente.findById(req.params.id).then((result) => {
        if(!result){
            return res.status(404).send({ output: `Usuário não encontrado` });
        }
        const nomecompleto = result.nomecompleto
        const email = result.email
        Conta.findOne({email:email}).then((result) => {
            if(result){
                return res.status(400).send({ output: `Email em uso. Use um diferente.`});
            }
            req.body.nome_titular = nomecompleto;
            req.body.email = email;
            req.body.apikey = req.headers.token;
            const dados = new Conta(req.body);
            dados.save().then((result) => {
                res.status(201).send({ output: `Conta cadastrada com sucesso`, payload: result });
            }).catch((erro) => {
                res.status(500).send({ output: `Erro ao cadastrar conta -> ${erro}` });
            });
        });
    });
})

router.put("/atualizar/:id", verificarToken, (req, res) => {
    Conta.findByIdAndUpdate(req.params.id, req.body, {new:true}).then((result) => {
        if(!result){
            return res.status(400).send({ output: `Não foi possível atualizar` });
        }
        res.status(202).send({ output: `Atualizado`, payload:result });
    }).catch((erro) => {
        res.status(500).send({ output: `Erro ao processar a solicitação -> ${erro}` });
    });
});

router.delete("/delete/:id", verificarToken,(req, res) => {
    Conta.findByIdAndDelete(req.params.id).then((result) => {
        res.status(204).send({ output: `Conta apagada` });
    }).catch((erro) => console.log(`Erro ao tentar apagar -> ${erro}` ));
});

/*
router.post("/insert", (req, res) => {
    bcrypt.hash(req.body.senha,config.bcrypt_salt,(err, result) => {
        if(err){
            return res.status(500).send({output: `Erro ao gerar a senha -> ${err}`});
        }
    
        req.body.senha = result;

        const dados = new Cliente(req.body);
        dados.save().then((result) => {
            res.status(201).send({ output: `Cadastro realizado`, payload: result });
        }).catch((erro) => {
            res.status(500).send({ output: `Erro ao cadastrar -> ${erro}` });
        });
    });
});

router.put("/update/:id", verificarToken,(req, res) => {
    Cliente.findByIdAndUpdate(req.params.id, req.body, {new:true}).then((result) => {
        if(!result){
            return res.status(400).send({ output: `Não foi possível atualizar` });
        }
        res.status(202).send({ output: `Atualizado`, payload:result });
    }).catch((erro) => {
        res.status(500).send({ output: `Erro ao processar a solicitação -> ${erro}` });
    });
});

router.post("/login", (req,res)=>{
    const usuario = req.body.usuario;
    const senha = req.body.senha;

    Cliente.findOne({usuario:usuario}).then((result) => {
        if(!result){
            return res.status(404).send({output:`Usuário não encontrado`});
        }
        bcrypt.compare(senha, result.senha).then((rs) => {
            if(!rs){
                return res.status(400).send({output:`Senha incorreta`});
            }
            
            const token = gerarToken(result._id, result.usuario, result.email);
            res.status(200).send({output:`Autenticado`, token:token});
        }).catch((err) => res.status(500).send({output:`Erro ao processar dados ${err}`}));
    }).catch((error)=>res.status(500).send({output:`Erro ao tentar efetuar o login ${error}`}));
});

router.post("/updatePassword/:id", verificarToken, (req, res) => {
    // const usuario = req.body.usuario;
    const senhaatual = req.body.senhaatual;
    const senhanova = req.body.senha;

    Cliente.findById(req.params.id).then((result)=> {
        if(!result){
            return res.status(404).send({output:`Usuário não encontrado`});
        }
        bcrypt.compare(senhaatual, result.senha).then((rs) => {
            if(!rs){
                return res.status(400).send({output:`Senha atual incorreta`});
            }

            bcrypt.hash(senhanova, config.bcrypt_salt, (err, senhanovacriptografada) => {
                if(err){
                    return res.status(500).send({output: `Erro ao gerar a senha -> ${err}`});
                }
                // res.status(202).send({ output: `Atualizado`, payload:result });

                Cliente.findByIdAndUpdate(req.params.id, {senha: senhanovacriptografada}, {new:true}).then((result) => {
                    if(!result){
                        return res.status(400).send({ output: `Não foi possível atualizar` });
                    }
                    res.status(202).send({ output: `Atualizado`, payload:result });
                }).catch((erro) => {
                    res.status(500).send({ output: `Erro ao processar a solicitação -> ${erro}` });
                });
            });
        }).catch((err) => res.status(500).send({output:`Erro ao processar dados -> ${err}`}));
    }).catch((error)=>res.status(500).send({output:`Erro ao procurar usuario -> ${error}`}));
});
*/

router.use((req, res) => {
    res.type("application/json");
    res.status(404).send({msg:`404 - Page Not Found`});
});

module.exports = router;