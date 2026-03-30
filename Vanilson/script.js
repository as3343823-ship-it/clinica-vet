const tarefas = [
    'Comer mais de um pato',
    'Comer mais de um pão',
    'Comer para emagrecer e comer mais ',
    'Estudar para futuramente trabalhar e comprar comida',
    'comida é tudo que eu quero, então é pela comida'
]

const exibir = document.getElementById('caixa')
const todasTarefas = [...document.querySelectorAll('.ai')]
const botaoEliminar = document.getElementById('eliminar')


tarefas.map((elemento,indice)=>{

    const tarefinha = document.createElement('div')
    tarefinha.setAttribute('class', 'tare ai')
    tarefinha.setAttribute('id','tarefa'+indice)
    tarefinha.innerHTML = elemento

    const botoes = document.createElement('div')
    const b1 = document.createElement('button')
    b1.setAttribute('class','b1')
    b1.innerHTML = 'Editar'
    const b2 = document.createElement('button')
    b2.innerHTML = 'Eliminar'
    b2.setAttribute('id','eliminar')



  
    botoes.appendChild(b1)
      botoes.appendChild(b2)
    tarefinha.appendChild(botoes)
    exibir.appendChild(tarefinha)

    
  

})

botaoEliminar.addEventListener('click', ()=>{

todasTarefas.map((e)=>{
    e.parentNode.parentNode.remove()
})

    

})






