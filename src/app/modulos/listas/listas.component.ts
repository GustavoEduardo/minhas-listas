import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';


const TRASH_ICON =
  `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.663 1.5h-1.326c-1.069 0-1.49.09-1.921.27-.432.181-.792.453-1.084.82-.292.365-.493.746-.784 1.774L7.368 5H5a1 1 0 0 0 0 2h.563l.703 11.25c.082 1.32.123 1.98.407 2.481a2.5 2.5 0 0 0 1.083 1.017C8.273 22 8.935 22 10.258 22h3.484c1.323 0 1.985 0 2.502-.252a2.5 2.5 0 0 0 1.083-1.017c.284-.5.325-1.16.407-2.482L18.437 7H19a1 1 0 1 0 0-2h-2.367l-.18-.636c-.292-1.028-.493-1.409-.785-1.775a2.694 2.694 0 0 0-1.084-.819c-.431-.18-.852-.27-1.92-.27zm1.89 3.5-.025-.09c-.203-.717-.29-.905-.424-1.074a.696.696 0 0 0-.292-.221c-.2-.084-.404-.115-1.149-.115h-1.326c-.745 0-.95.031-1.149.115a.696.696 0 0 0-.292.221c-.135.169-.221.357-.424 1.074L9.446 5h5.108zM9.61 8.506a.75.75 0 0 0-.724.776l.297 8.495a.75.75 0 0 0 1.499-.053l-.297-8.494a.75.75 0 0 0-.775-.724zm4.008.724a.75.75 0 0 1 1.499.052l-.297 8.495a.75.75 0 0 1-1.499-.053l.297-8.494z" fill="#CA5545"/></svg>
`;

@Component({
  selector: 'app-listas',
  templateUrl: './listas.component.html',
  styleUrls: ['./listas.component.scss']
})
export class ListasComponent implements OnInit {

  // @Input() listas: any = [{
  //   nome: 'Lista 1',
  //   id: 1,
  //   data: new Date(),
  //   terefas: [
  //     {
  //     titulo: 'tarefa 1',
  //     concluida: false
  //     },{
  //       titulo: 'tarefa 2',
  //       concluida: true
  //     },{
  //       titulo: 'tarefa 3',
  //       concluida: false
  //     },]
  // }];

  @Input() listas: any = [];

  listaSelecionada: any = {nome: '', tarefas: []};

  openMenu = false;

  formInvalid = false;

  formAddTarefaVisible = false;
  formAddListaVisible = false;

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer){

    iconRegistry.addSvgIconLiteral('trash', sanitizer.bypassSecurityTrustHtml(TRASH_ICON));
  }

  ngOnInit(): void {
    this.listas = JSON.parse(localStorage.getItem('minhas-listas-vofazer') || "[]");
    this.listaSelecionada = JSON.parse(localStorage.getItem('lista-selecionada-vofazer') || JSON.stringify({nome: '', tarefas: []}));

    if(this.listas.length === 0){
      alert("Crie uma lista de tarefas para começar.")
      this.openMenu = true;
      this.showModalAddListavisible(true);
    }

  }

  ngDoCheck(){
    this.calculaPorcentagem();
    localStorage.setItem('minhas-listas-vofazer',JSON.stringify(this.listas));
    localStorage.setItem('lista-selecionada-vofazer',JSON.stringify(this.listaSelecionada));
  }

  calculaPorcentagem(){
    this.listas.forEach((l: any)=>{
      let concluidas = 0;
      l.tarefas.forEach((t: any)=>{
        if (t.concluida) concluidas ++
      });

      l.porcentagem = l.tarefas.length > 0 ? ((concluidas *100) / l.tarefas.length).toFixed(2): 0;
    })
  }

  selecioarLista(lista: any){
      this.listaSelecionada = lista
      this.openMenu = false;
      localStorage.setItem('lista-selecionada-vofazer',JSON.stringify(lista));
  }

  showModalAddListavisible(visible: boolean){
    this.formAddListaVisible = visible;

    if(!visible){
      this.formInvalid = false;
    }
  }

  novaLista(form: NgForm){

    form.value.titulo = form.value.titulo ? form.value.titulo.trim() : null;

    if(form.valid && form.value.titulo.length > 0){

      const newList = {
        nome: form.value.titulo,
        id: form.value.titulo + Math.round(Math.random()*1000) + new Date().getTime(),
        data: new Date(),
        tarefas: [],
        porcentagem: 0
      }

      this.listas.push(newList)
      this.formInvalid = false;
      this.formAddListaVisible = false;
      localStorage.setItem('minhas-listas-vofazer',JSON.stringify(this.listas));
    }else{
     this.formInvalid = true;
    }

  }

  excluirLista(index: number) {
    if(confirm("Tem certeza de que deseja excluir essa lista ?")) {
      if(this.listas[index].id == this.listaSelecionada.id){
        localStorage.setItem('lista-selecionada-vofazer', '[]');
        this.listaSelecionada = [];
      }
      this.listas.splice(index, 1);
    }
  }

  showModalAddTarefavisible(visible: boolean){

    if(visible && (!this.listaSelecionada || this.listaSelecionada.nome?.length === 0)){
      this.formInvalid = false;
      alert("Selecione uma lista antes de criar uma tarefa");
      this.openMenu = true;
    }else if(!visible){
      this.formAddTarefaVisible = visible;
      this.formInvalid = false;
    }else{
      this.formAddTarefaVisible = visible;
    }
  }

  novaTarefa(form: NgForm){

    form.value.titulo = form.value.titulo ? form.value.titulo.trim() : null;

    if(form.valid && form.value.titulo.length > 0){
      this.listaSelecionada.tarefas.push({titulo: form.value.titulo, concluida: false});
      this.formInvalid = false;
      this.formAddTarefaVisible = false;
      this.listas.forEach((l: any)=>{
        if (this.listaSelecionada.id == l.id){
            l = this.listaSelecionada;
        }
      })
      localStorage.setItem('minhas-listas-vofazer',JSON.stringify(this.listas));
    }else{
     this.formInvalid = true;
    }

  }

  excluirTarefa(index: number) {
    if(confirm("tem certeza de que deseja excluir essa tarefa ?")) {
      this.listaSelecionada.tarefas.splice(index, 1);
    }
  }

}
