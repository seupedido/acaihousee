$(document).ready(function () {

	$(window).scroll(function () {
		if ($('.categorias').length > 0) {
			let windowTop = $(window).scrollTop();
			let menuCategorias = $('.categorias').position().top;
			$('#menuCategorias').toggleClass('fixed', windowTop > menuCategorias);
		}
	});

	$(document).on('click', '#menuCategorias .categorias a', function (e) {
		e.preventDefault();
		$('#menuCategorias .categorias a').removeClass('ativo');
		$(this).addClass("ativo");
		let aid = $(this).attr("href");
		$('html,body').animate({ scrollTop: $(aid).offset().top - 100 }, 'slow');
	});

	$(document).on('click', '#produto a.voltar', function (e) {
		e.preventDefault();
		inicio();
	});

	$(document).on('click', '#topo .info .icones a.informacoes', function (e) {
		e.preventDefault();
		$('#opacidade').addClass('opacidade', 1000);
		$('#info').addClass('mostrar', 1000);
		$('body').css('overflow', 'hidden');
	});

	$(document).on('click', '#carrinho a.verSacola', function (e) {
		e.preventDefault();
		$('#opacidade').addClass('opacidade', 1000);
		$('#meuCarrinho').addClass('mostrar', 1000);
		$('body').css('overflow-y', 'hidden');
	});

	$(document).on('click', 'button#btFinalizar', function (e) {
		e.preventDefault();
		verificarConexaoInternet().then(status => {
			if (status === 'conectado') {
				let urlLoja = $('body').data('urlloja');
				window.location.href = "loja/" + urlLoja + "/finalizar";
			} else {
				$('#modalCarregando').hide();
				$("#modal button").addClass('confirmar');
				mostrarPopup('Sem ConexÃ£o com a Internet',
					'Parece que vocÃª estÃ¡ offline. Verifique sua conexÃ£o com a internet e tente novamente.');
				return;
			}
		});
	});

	$(document).on('click', '.confirmar', function (e) {
		let urlLoja = $('body').data('urlloja');
		//window.location.href = "loja/" + urlLoja;
	});

	$(document).on('click', '.fechar', function (e) {
		e.preventDefault();
		$('#opacidade').removeClass('opacidade', 1000);
		$('#meuCarrinho').removeClass('mostrar', 1000);
		$('#info').removeClass('mostrar', 1000);
		$("#modal").hide();
		$('body').css('overflow-y', 'auto');
	});

	$(document).on('click', '.entendi', function (e) {
		e.preventDefault();
		$('#opacidade').removeClass('opacidade', 1000);
		$('#meuCarrinho').removeClass('mostrar', 1000);
		$("#modal").hide();
	});

	/*adicionar qtde produto*/
	$(document).on('click', '.adicionarQtde', function (e) {
		e.preventDefault();
		let qtde = parseInt($('#detalhesProduto .info3 .qtdeProduto .qtde').val());
		let max = parseInt($(this).parents('.qtdeProduto').find('.qtde').attr('max'));
		if (qtde + 1 <= max) {
			$('#detalhesProduto .info3 .qtdeProduto .qtde').val(qtde + 1);
		} else {
			$('#detalhesProduto .info3 .qtdeProduto .qtde').val(max);
		}
		verificarBotaoAdicionarProduto();
	});

	/*remover qtde produto*/
	$(document).on('click', '.removerQtde', function (e) {
		e.preventDefault();
		let qtde = parseInt($('#detalhesProduto .info3 .qtdeProduto .qtde').val());
		if (qtde < 1) {
			$('#detalhesProduto .info3 .qtdeProduto .qtde').val(1);
		} else {
			$('#detalhesProduto .info3 .qtdeProduto .qtde').val(qtde - 1);
		}
		verificarBotaoAdicionarProduto();
	});

	/*adicionar produto*/
	var DELAY = 300, clicks = 0, timer = null;
	$(document).on('click', '.adicionarProduto', function (e) {
		e.preventDefault();
		clicks++;
		if (clicks === 1) {
			$('#modalCarregando').show();
			timer = setTimeout(function () {

				let pixel = $('body').data('pixel');
				let urlLoja = $('body').data('urlloja');
				verificarConexaoInternet().then(status => {
					if (status === 'conectado') {
						let lojaAberta = verificarLojaAberta();
						if (lojaAberta.trim() == 's') {
							let idUsuario = $('body').data('idusuario');
							let idProduto = $("#idProduto").val();

							readJsonFile("../../../delivery/json/loja-" + idUsuario + ".json", function (text) {
								var data = JSON.parse(text);

								let nomeProduto = $("#detalhesProduto .info1 h3").text();
								nomeProduto = nomeProduto.replace(/\+/g, "##");
								let detalheProduto = $("#detalhesProduto .info1 .detalhe").text();
								detalheProduto = detalheProduto.replace(/\+/g, "##");
								let qtdeProduto = $("#detalhesProduto .info3 .qtdeProduto .qtde").val();

								let precoProduto = $("#detalhesProduto .info3 .precoProduto").text();
								let precoProduto2 = 0;

								$.each(data.categorias, function (key, categoria) {
									$.each(categoria.produtos, function (key2, produto) {
										if (idProduto == produto.id) {
											precoProduto2 = (parseFloat(produto.preco) > parseFloat(produto.precoPromocao) && parseFloat(produto.precoPromocao) > 0) ? produto.precoPromocao : produto.preco;
										}
									});
								});

								let obsProduto = $("#detalhesProduto .info2 .observacao").val();

								let complementosProduto = "";
								let continuar = true;
								const complementosChaves = [];

								$("#detalhesProduto .info2 .tipo").each(function () {
									const opcoesChaves = [];
									let atual = $(this);

									let idTipo = atual.data("id");

									let minimo = atual.data('minimo');
									let maximo = atual.data('maximo');

									$.each(data.categorias, function (key, categoria) {
										$.each(categoria.produtos, function (key2, produto) {
											if (idProduto == produto.id) {
												$.each(produto.tiposComplementos, function (key3, tiposComplementos) {
													if (idTipo == tiposComplementos.id) {
														minimo = tiposComplementos.minimo;
														maximo = tiposComplementos.maximo;
													}
												});
											}
										});
									});

									let tipo = atual.find('h3').text() + '<br />';
									let opcoes = atual.find(".opcoes");
									let opcao = "";
									let tamanho = 0;
									let contador = 0;
									$(opcoes).each(function () {
										if ($(this).find("input:checkbox").is(":checked")) {
											contador += 1;
										}
										if ($(this).find('input.qtdeOpcao').val() > 0) {
											contador += parseInt($(this).find("input.qtdeOpcao").val());
											tamanho += 1;
										}
									});

									if (minimo > contador || (contador > maximo && maximo > 0)) {
										$('#modalCarregando').hide();
										//let idTipo = atual.attr("id");
										let nomeTipo = atual.find('h3').text();
										let infoTipo = atual.find('span.detalhe').text();
										mostrarPopup(nomeTipo, infoTipo);
										//$('#produto').animate({scrollTop: $("#"+idTipo).offset().top}, 2000);
										continuar = false;
										return false;
									}

									if (continuar) {
										$(opcoes).each(function () {
											let idOpcao = $(this).attr("data-id");
											if ($(this).find("input:checkbox").is(":checked")) {
												opcao += '- ' + $(this).find("b").text() + '<br />';
												opcoesChaves.push({
													idOpcao: idOpcao,
													qtde: 1,
													checkbox: true
												});
											}
											if ($(this).find('input.qtdeOpcao').val() > 0) {
												if (tamanho > 0) {
													opcao += $(this).find('input.qtdeOpcao').val() + ' - ' + $(this).find("b").text() + '<br />';
												} else {
													opcao += '- ' + $(this).find("b").text() + '<br />';
												}
												opcoesChaves.push({
													idOpcao: idOpcao,
													qtde: $(this).find('input.qtdeOpcao').val()
												});
											}
										});
										if (opcao != "") {
											complementosProduto += tipo + opcao;
											complementosChaves.push({ idTipo: idTipo, opcoes: opcoesChaves });
										}
									}
								});

								if (continuar) {
									if (parseFloat(precoProduto) < parseFloat(precoProduto2)) {
										window.location.href = "loja/" + urlLoja;
										return false;
									}

									complementosProduto = complementosProduto.replace(/\+/g, "##");
									$.ajax({
										type: "post",
										url: "delivery/carrinho.php",
										data: { acao: 'addProduto', idUsuario: idUsuario, idProduto: idProduto, nomeProduto: nomeProduto, detalheProduto: detalheProduto, qtdeProduto: qtdeProduto, precoProduto: precoProduto, obsProduto: obsProduto, complementosProduto: complementosProduto, complementosChaves: complementosChaves },
										async: false,
										cache: false,
										datatype: "text",
										beforeSend: function () { },
										success: function (data) {
											$('#modalCarregando').hide();
											if (pixel != "") {
												fbq('track', 'AddToCart');
											}
											let produto = $('#produto').html();
											if ($('.lojaFechada').length > 0 || produto == undefined) {
												window.location.href = "loja/" + urlLoja;
											}
											$('#meuCarrinho .pedido').html(data);
											inicio();
										},
										error: function () { }
									});
								}
							});
						} else {
							$('#modalCarregando').hide();
							$("#modal button").addClass('confirmar');
							mostrarPopup('Esta loja estÃ¡ fechada no momento.',
								'Mas vocÃª pode olhar Ã  vontade e voltar quando a loja estiver aberta.');
							return
						}
					} else {
						$('#modalCarregando').hide();
						$("#modal button").addClass('confirmar');
						mostrarPopup('Sem ConexÃ£o com a Internet',
							'Parece que vocÃª estÃ¡ offline. Verifique sua conexÃ£o com a internet e tente novamente.');
						return;
					}
				});
				clicks = 0;             //apos executado zera o timer
			}, DELAY);
		} else {
			$('#modalCarregando').hide();
			clearTimeout(timer);    //previne o click unico action
			clicks = 0;             //apos fazer a aÃ§Ã£o reseta o timer
		}
	}).on("dblclick", function (e) {
		e.preventDefault();  //cancela   o double click default do navegador
	});

	/*adicionar qtde carrinho*/
	$(document).on('click', '.adicionarQtdeCarrinho', function (e) {
		e.preventDefault();
		let elemento = $(this).parent().prev();
		let idProduto = $(elemento).text();
		let idItemCarrinho = $(this).data('item');
		let idUsuario = $('body').data('idusuario');

		let qtde = parseInt($(this).parents('.qtdeProduto').find('.qtde').val());
		let max = parseInt($(this).parents('.qtdeProduto').find('.qtde').attr('max'));

		$.ajax({
			type: "post",
			url: "delivery/carrinho.php",
			data: "acao=addQtde&idItemCarrinho=" + idItemCarrinho + "&idProduto=" + idProduto + "&qtdeProduto=1&qtde=" + qtde + "&max=" + max + "&idUsuario=" + idUsuario,
			async: false,
			cache: false,
			datatype: "text",
			beforeSend: function () { },
			success: function (data) {
				$(".pedido").html(data);
				atualizar();
			},
			error: function () { }
		});
	});

	/*remover qtde carrinho*/
	$(document).on('click', '.removerQtdeCarrinho', function (e) {
		e.preventDefault();
		let elemento = $(this).parent().prev();
		let idProduto = $(elemento).text();
		let idItemCarrinho = $(this).data('item');
		let idUsuario = $('body').data('idusuario');
		$.ajax({
			type: "post",
			url: "delivery/carrinho.php",
			data: "acao=remQtde&idItemCarrinho=" + idItemCarrinho + "&idProduto=" + idProduto + "&idUsuario=" + idUsuario,
			async: false,
			cache: false,
			datatype: "text",
			beforeSend: function () { },
			success: function (data) {
				$(".pedido").html(data);
				atualizar();
			},
			error: function () { }
		});
	});

	$(document).on('click', '.entrega #entrega', function (e) {
		$(".mostrarRetirada").hide();
		$(".mostrarEntrega").css("display", "table");
		$("#bairro").val("");
		$("#bairro").prop('required', true);
		$("#endereco").prop('required', true);
		$("#numero").prop('required', true);
		atualizarResumo();
	});

	$(document).on('click', '.entrega #retirada', function (e) {
		$(".mostrarEntrega").hide();
		$(".mostrarRetirada").css("display", "flex");
		$("#bairro").prop('required', false);
		$("#endereco").prop('required', false);
		$("#numero").prop('required', false);
		atualizarResumo();
	});

	$(document).on('click', '.entrega #consumo', function (e) {
		$(".mostrarEntrega").hide();
		$(".mostrarRetirada").hide();
		$("#bairro").prop('required', false);
		$("#endereco").prop('required', false);
		$("#numero").prop('required', false);
		atualizarResumo();
	});

	$(document).on('change', '.mostrarEntrega #bairro', function (e) {
		e.preventDefault();
		atualizarResumo();
	});

	if ($("select[name=bairro]").length > 0) {
		atualizarResumo();
	}

	$(document).on('change', '.trocarPontos input[type="checkbox"]', function (e) {
		e.preventDefault();
		atualizarResumo();
	});

	$(document).on('click', '.pagamentos .msg', function (e) {
		e.preventDefault();
		$("input[name='pagamento']").attr("checked", false);
		let item = $(this).parents('.item');
		item.find("input[name='pagamento']").attr("checked", true);
		copiarChavePix(item);
		//gerarPixCopiaECola(item);
	});

	$(document).on('change', '.pagamentos input[type="radio"]', function (e) {
		e.preventDefault();
		$("input[name='pagamento']").attr("checked", false);
		$(this).attr("checked", true);
		let tipo = $(this).val();
		if (tipo.toLowerCase() === 'dinheiro') {
			$(".troco").show();
		} else {
			if (tipo.toLowerCase().indexOf('pix#') !== -1) {
				let item = $(this).parent('.item');
				copiarChavePix(item);
				//gerarPixCopiaECola(item);								
			}
			$(".troco").hide();
		}
		atualizarResumo();
	});

	$(document).on('click', '#btEnviarPedido', function (e) {
		e.preventDefault();
		$('#modalCarregando').show();
		verificarConexaoInternet().then(status => {
			if (status === 'conectado') {
				let pixel = $('body').data('pixel');
				let entrega = '-';
				if ($('.entrega').text().trim() !== '') {
					entrega = $("input[name='entrega']:checked").val();
				}

				if ($('#nome').val().trim() == '') {
					mostrarPopup('Nome obrigatÃ³rio',
						'Por favor, preencha o campo com seu nome completo.');
					$('#nome').focus();
					$('#modalCarregando').hide();
					return
				}
				if ($('#telefone').val().trim() == '' || $('#telefone').val().length < 14) {
					mostrarPopup('Telefone obrigatÃ³rio',
						'Por favor, digite o nÃºmero do seu celular.');
					$('#telefone').focus();
					$('#modalCarregando').hide();
					return
				}

				if (entrega == undefined) {
					mostrarPopup('Entrega obrigatÃ³rio',
						'Por favor, selecione o tipo de entrega.');
					$("input[name='entrega']").focus();
					$('#modalCarregando').hide();
					return
				}

				if (entrega.toLowerCase() === 'entrega') {
					if ($('#bairro').val().trim() == -1) {
						mostrarPopup('Bairro obrigatÃ³rio',
							'Por favor, selecione um bairro para entrega.');
						$('#bairro').focus();
						$('#modalCarregando').hide();
						return
					}
					if ($('#endereco').val().trim() == '') {
						mostrarPopup('EndereÃ§o obrigatÃ³rio',
							'Por favor, informe o endereÃ§o para entrega.');
						$('#endereco').focus();
						$('#modalCarregando').hide();
						return
					}
					if ($('#numero').val().trim() == '') {
						mostrarPopup('NÃºmero obrigatÃ³rio',
							'Por favor, informe o nÃºmero do local para entrega.');
						$('#numero').focus();
						$('#modalCarregando').hide();
						return
					}
				}

				let observacao = $("#observacao").val();
				let nome = $("#nome").val();
				let telefone = $("#telefone").val();
				let bairro = $("#bairro option:selected").text();
				let endereco = $("#endereco").val();
				let numero = $("#numero").val();
				let complemento = $("#complemento").val();
				let referencia = $("#referencia").val();
				let subtotal = parseFloat($(".valores .subtotal").text());
				let taxa = $("#bairro option:selected").val();
				if (taxa == -1 || taxa == undefined) {
					taxa = 0;
				} else {
					let freteGratis = parseFloat($(".valores .freteGratisPedido").text());
					if (subtotal > freteGratis && freteGratis > 0) {
						taxa = 0;
					} else {
						taxa = parseFloat(taxa);
					}
				}
				let taxaCartao = 0;
				if ($(".valores .taxaCartaoPedido").length > 0) {
					taxaCartao = parseFloat($(".valores .taxaCartaoPedido").text());
				}

				let descontoPorPontosFidelidade = 0;
				let pontosFidelidadeUtilizados = 0;
				if ($('.trocarPontos input[type="checkbox"]').is(":checked")) {
					descontoPorPontosFidelidade = parseFloat($(".descontoPorPontosFidelidade").text());
					pontosFidelidadeUtilizados = $(".pontosFidelidadeUtilizados").text();
				}

				let cupom = "";
				let descontoPorCupom = 0;
				let tipoCupom = "";
				if ($('#cupom').length > 0) {
					cupom = $('#cupom').val();
					descontoPorCupom = parseFloat($('.descontoPorCupom').text());
					if (cupom.length > 0 && descontoPorCupom == 0) {
						mostrarPopup('Cupom',
							'Por favor, clique em enviar o cupom.');
						$('#cupom').focus();
						$('#modalCarregando').hide();
						return
					}
					tipoCupom = $('.tipoCupom').text();
					if (descontoPorCupom == 0) {
						cupom = "";
						tipoCupom = "";
					}
				}
				let pagamento = $("input[name='pagamento']:checked").val();

				if (taxa + subtotal - descontoPorPontosFidelidade - descontoPorCupom == 0) {
					pagamento = "Pontos";
				}
				if (pagamento == undefined) {
					mostrarPopup('Forma de pagamento obrigatÃ³rio',
						'Por favor, selecione a forma de pagamento.');
					$("input[name='pagamento']").focus();
					$('#modalCarregando').hide();
					return
					//pagamento = "-";
				}
				let troco = $("#troco").val();
				//if (pagamento.toLowerCase() == 'dinheiro'){
				if (pagamento.toLowerCase() == 'dinheiro' && troco !== ''){
					troco = parseFloat(troco);
					if(troco < (taxa + subtotal - descontoPorPontosFidelidade - descontoPorCupom)) {
						mostrarPopup('Troco incorreto',
						'Por favor, informe o valor para troco correto.');
						$("#troco").focus();
						$('#modalCarregando').hide();
						return
					}
				}else{
					troco = 0;
				}
				let idUsuario = $('body').data('idusuario');
				$.ajax({
					type: "post",
					url: "delivery/enviarPedido.php",
					data: "idUsuario=" + idUsuario + "&observacao=" + observacao + "&nome=" + nome + "&telefone=" + telefone + "&entrega=" + entrega + "&bairro=" + bairro +
						"&endereco=" + endereco + "&numero=" + numero + "&complemento=" + complemento + "&referencia=" + referencia +
						"&subtotal=" + subtotal + "&descontoPorPontosFidelidade=" + descontoPorPontosFidelidade + "&cupom=" + cupom + "&descontoPorCupom=" + descontoPorCupom + "&tipoCupom=" + tipoCupom + "&taxa=" + taxa + "&taxaCartao=" + taxaCartao + "&pagamento=" + pagamento + "&troco=" + troco + "&pontosFidelidadeUtilizados=" + pontosFidelidadeUtilizados,
					async: false,
					cache: false,
					datatype: "text",
					beforeSend: function () { },
					success: function (data) {
						const obj = JSON.parse(data);

						if (obj.semEstoque) {
							let idsProdutos = obj.produtosSemEstoque;
							$('.lista .item').each(function () {
								let idProduto = parseInt($(this).find('.idProduto').text());
								idsProdutos.filter((item) => {
									if (item == idProduto) {
										$(this).find('b').show();
									} else {
										$(this).find('b').hide();
									}
								});
							});
							let msg = "Desculpe, mas tem produtos do seu carrinho que nÃ£o temos mais em estoque.";
							mostrarPopup('Ops! ', msg);
							$('#modalCarregando').hide();
						} else {

							if (pixel != "") {
								fbq('track', 'Purchase', { value: ((subtotal + taxa) - descontoPorPontosFidelidade - descontoPorCupom), currency: 'BRL' });
							}

							if (obj.rastreamento) {
								if (obj.pedido) {

									let urlWhatsapp = "https://wa.me/55" + obj.telefone + "?text=Oi, meu nome Ã© *" + nome + "* e acabei de fazer o pedido de nÃºmero *" + obj.pedido + "* no seu cardÃ¡pio digital.%20%0A%0A%C2%B0%C2%B0%C2%B0%20*Acompanhe seu pedido aqui*%20%C2%B0%C2%B0%C2%B0%0A%0A " + (obj.rastreamento);

									/*window.open(
										"https://wa.me/55" + obj.telefone + "?text=Oi, meu nome Ã© *" + nome + "* e acabei de fazer o pedido de nÃºmero *" + obj.pedido + "* no seu cardÃ¡pio digital.%20%0A%0A%C2%B0%C2%B0%C2%B0%20*Acompanhe seu pedido aqui*%20%C2%B0%C2%B0%C2%B0%0A%0A " + (obj.rastreamento).replace('https://', ''),
										"_blank" // <- This is what makes it open in a new window.
									);*/
									$('#pedido .containerFinalizar form').hide('slow');
									$('#pedido .containerFinalizar #obrigado h2').html("Pedido " + obj.pedido + " concluÃ­do com sucesso!");
									$('#pedido .containerFinalizar #obrigado h3').html("Favor encaminhar seu pedido via WhatsApp para agilizar o seuÂ atendimento.");
									$('#pedido .containerFinalizar #obrigado').show('slow');

									$('#urlWhatsapp').attr('href', urlWhatsapp);
								} else {
									window.location.href = obj.rastreamento
								}
								/*if (obj.pedido) {
									window.open(
										"https://wa.me/55" + obj.telefone + "?text=Oi, meu nome Ã© *" + nome + "* e acabei de fazer o pedido de nÃºmero *" + obj.pedido + "* no seu cardÃ¡pio digital.%20%0A%0A%C2%B0%C2%B0%C2%B0%20*Acompanhe seu pedido aqui*%20%C2%B0%C2%B0%C2%B0%0A%0A " + (obj.rastreamento).replace('https://', ''),
										"_blank" // <- This is what makes it open in a new window.
									);
								}
								window.location.href = obj.rastreamento*/
							} else {
								if (obj.telefone) {
									let meuPedido = obj.pedido.replace(/<br \/>|<br\/>/g, '%0A');
									meuPedido = meuPedido.replace('Total do pedido:', '*Total do pedido:*');
									meuPedido = meuPedido.replace('Subtotal:', '*Subtotal:*');
									meuPedido = meuPedido.replace('Total:', '*Total:*');
									meuPedido = meuPedido.replace('Forma de pagamento:', '*Forma de pagamento:*');
									meuPedido = meuPedido.replaceAll('Entrega:', '*Entrega:*');
									meuPedido = meuPedido.replaceAll('Taxa de entrega:', '*Taxa de entrega:*');
									meuPedido = meuPedido.replaceAll('Taxa de cartÃ£o:', '*Taxa de cartÃ£o:*');
									meuPedido = meuPedido.replace('Cliente:', '*Cliente:*');
									meuPedido = meuPedido.replaceAll('&', '%26');
									meuPedido = meuPedido.replaceAll('#', '%23');

									let urlWhatsapp = "https://wa.me/55" + obj.telefone + "?text=Oi, meu nome Ã© *" + nome + "* e acabei de fazer o pedido no seu cardÃ¡pio digital, segue abaixo:%0A%0A" + meuPedido;

									$('#pedido .containerFinalizar form').hide('slow');
									$('#pedido .containerFinalizar #obrigado').show('slow');

									$('#urlWhatsapp').attr('href', urlWhatsapp);

									/*window.open(
										urlWhatsapp,
										"_blank" // <- This is what makes it open in a new window.
									);*/
								} else {
									window.location.href = obj.obrigado
								}
							}
						}
						$('#modalCarregando').hide();
						//return false
					},
					error: function () {
						let msg = "Desculpe, houve um erro ao salvar seu pedido. Tente novamente mais tarde.";
						mostrarPopup('Ops! ', msg);
						$('#modalCarregando').hide();
					}
				});
			} else {
				$("#modal button").addClass('confirmar');
				mostrarPopup('Sem ConexÃ£o com a Internet',
					'Parece que vocÃª estÃ¡ offline. Verifique sua conexÃ£o com a internet e tente novamente.');
				$('#modalCarregando').hide();
				return
			}
		});
	});

	let btAtualizar = $('#btAtualizar')
	if (btAtualizar) {
		setTimeout(function () {
			btAtualizar.trigger('click')
		}, 60000)
	}

	//mascara telefone e celular
	let mascaraTelefone = function (val) {
		return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
	},
		optionsTelefone = {
			onKeyPress: function (val, e, field, options) {
				field.mask(mascaraTelefone.apply({}, arguments), options);
			}
		};

	$('.telefone').mask(mascaraTelefone, optionsTelefone);

	$(".valorDelivery").mask('000.000.000.000.000,00', { reverse: true });
	$(".codigoConfirmacao input").mask('0-0-0-0-0-0', { reverse: true });

	/*adicionar qtde opcao*/
	$(document).on('click', '.adicionarQtdeOpcao', function (e) {

		let minimo = $(this).parents('.tipo').data('minimo');
		let maximo = $(this).parents('.tipo').data('maximo');
		let proximo = $(this).parents('.tipo').next().attr('id');

		$(this).parents('.qtdeProdutoOpcao').addClass('selecionado');

		let qtde = parseInt($(this).parent().find('.qtdeOpcao').val());
		$(this).parent().find('.qtdeOpcao').val(qtde + 1);
		let qtdeEscolhida = 0;
		$(this).parents('.tipo').find('input.qtdeOpcao').each(function () {
			qtdeEscolhida += parseInt($(this).val());
		});

		if (qtdeEscolhida == maximo && maximo > 0) {
			$(this).parents('.tipo').find('.qtdeProdutoOpcao').each(function () {
				$(this).find('.adicionarQtdeOpcao').attr("disabled", "disabled");
			});
		}

		if (proximo != undefined) {
			if (qtdeEscolhida == maximo) {
				if ($('#produto').length > 0) {
					let info1 = $('#produto .info1').prop('scrollHeight');
					let indice = $(this).parents('.tipo').data('indice');
					let somatorio = 0;
					$(this).parents('.info2').find('.tipo').each(function () {
						if (indice >= $(this).data('indice')) {
							somatorio += $(this).prop('scrollHeight');
						}
					});
					$('#produto').animate({ scrollTop: info1 + somatorio }, 'slow');
				} else {
					$('html, body').animate({ scrollTop: $(this).parents('.tipo').next().offset().top - 60 }, 'slow');
				}
			}
		}
		verificarBotaoAdicionarProduto();
	});

	/*remover qtde opcao*/
	$(document).on('click', '.removerQtdeOpcao', function (e) {
		let minimo = $(this).parents('.tipo').data('minimo');
		let maximo = $(this).parents('.tipo').data('maximo');

		let qtde = parseInt($(this).parent().find('.qtdeOpcao').val());

		if (qtde - 1 == 0) {
			$(this).parents('.qtdeProdutoOpcao').removeClass('selecionado');
		}
		if (qtde < 1) {
			$(this).parent().find('.qtdeOpcao').val(0);
		} else {
			$(this).parent().find('.qtdeOpcao').val(qtde - 1);
		}
		let qtdeEscolhida = 0;
		$(this).parents('.tipo').find('input.qtdeOpcao').each(function () {
			qtdeEscolhida += parseInt($(this).val());
		});

		if (qtdeEscolhida < maximo && maximo > 0) {
			$(this).parents('.tipo').find('.qtdeProdutoOpcao').each(function () {
				$(this).find('.adicionarQtdeOpcao').removeAttr("disabled");
			});
		}
		verificarBotaoAdicionarProduto();
	});

	/*maximo 1*/
	$(document).on('click', '.opcao', function (e) {
		let minimo = $(this).parents('.tipo').data('minimo');
		let maximo = $(this).parents('.tipo').data('maximo');

		let proximo = $(this).parents('.tipo').next().attr('id');
		let opcional = $(this).parents('.tipo').attr('data-opcional');
		if ($(this).prop('checked') === true) {
			$(this).parents('.tipo').find('input:checkbox').each(function () {
				if (opcional == 'n') {
					$(this).prop('checked', false);
				}
			});
			$(this).prop('checked', true);
		} else {
			$(this).prop('checked', false);
		}
		if (proximo != undefined && minimo > 0 && maximo > 0) {
			if ($('#produto').length > 0) {
				let info1 = $('#produto .info1').prop('scrollHeight');
				let indice = $(this).parents('.tipo').data('indice');
				let somatorio = 0;
				$(this).parents('.info2').find('.tipo').each(function () {
					if (indice >= $(this).data('indice')) {
						somatorio += $(this).prop('scrollHeight');
					}
				});
				$('#produto').animate({ scrollTop: info1 + somatorio }, 2000);
			} else {
				$('html, body').animate({ scrollTop: $(this).parents('.tipo').next().offset().top - 60 }, 2000);
			}
		}
		verificarBotaoAdicionarProduto();
	});

	$(document).on('click', '.btnEmail', function (e) {
		e.preventDefault();
		$('#login .form').show('slow');
	});

	/*enviar email com codigo*/
	$(document).on('click', '.loginEmail', function (e) {
		e.preventDefault();

		if ($('#nome').val().trim() == '') {
			mostrarPopup('Nome obrigatÃ³rio',
				'Por favor, preencha o campo com seu nome.');
			$('#nome').focus();
			return
		}
		if ($('#email').val().trim() == '' || $('#email').val().indexOf("@") == -1) {
			mostrarPopup('E-mail obrigatÃ³rio',
				'Por favor, preencha o campo com seu email.');
			$('#email').focus();
			return
		}
		$('form').hide('slow');
		$('.carregando').show('slow');

		setTimeout(function () {
			let nome = $('#nome').val();
			let email = $('#email').val();
			$.ajax({
				type: "post",
				url: "delivery/validarEmail.php",
				data: "nome=" + nome + "&email=" + email,
				async: false,
				cache: false,
				datatype: "text",
				beforeSend: function () { },
				success: function (data) {
					if (data) {
						$('.codigoConfirmacao').show('slow');
						$('.inputNome').hide('slow');
						$('.inputEmail').hide('slow');
						$('.loginEmail').hide();
						$('.confirmarCodigo').show();
					}
					$('.carregando').hide('slow');
					$('form').show('slow');
					return false
				},
				error: function () {
					$('.carregando').hide('slow');
					let msg = "Desculpe, houve um erro ao enviar o cÃ³digo para o seu e-mail. Tente novamente mais tarde.";
					mostrarPopup('Ops! ', msg)
				}
			});
		}, 2000);
	});

	/*validar codigo*/
	$(document).on('click', '.confirmarCodigo', function (e) {
		e.preventDefault();

		if ($('#codigoConfirmacao').val().trim() == '' || $('#codigoConfirmacao').val().length < 11) {
			mostrarPopup('CÃ³digo obrigatÃ³rio',
				'Por favor, preencha o campo com o cÃ³digo.');
			$('#codigoConfirmacao').focus();
			return
		}
		$('form').hide('slow');
		$('.carregando').show('slow');

		setTimeout(function () {
			let email = $('#email').val();
			let codigoConfirmacao = $('#codigoConfirmacao').val();
			$.ajax({
				type: "post",
				url: "delivery/validarCodigoEmail.php",
				data: "codigoConfirmacao=" + codigoConfirmacao + "&email=" + email,
				async: false,
				cache: false,
				datatype: "text",
				beforeSend: function () {
					$('.carregando').show('slow');
				},
				success: function (data) {
					$('.carregando').hide('slow');
					$('form').show('slow');
					if (data) {
						document.location.reload(true);
					} else {
						let msg = "Desculpe, mas o cÃ³digo informado nÃ£o estÃ¡ correto.";
						mostrarPopup('Ops! ', msg);
					}
					return false
				},
				error: function (data) {
					$('.carregando').hide('slow');
					//console.log(data);
					let msg = "Desculpe, houve um erro com a verificaÃ§Ã£o do seu cÃ³digo. Tente novamente mais tarde.";
					mostrarPopup('Ops! ', msg);
				}
			});
		}, 2000);
	});

	$(document).on('click', '#meuspedidos a.ver-pedido', function (e) {
		e.preventDefault();
		let numPedido = $(this).data('numpedido');
		let pedido = $(this).parents('.item').find('.pedido').html();
		$("#pedidoSelecionado h2 span").html(numPedido);
		$("#pedidoSelecionado .pedido").html(pedido);
		$("#pedidoSelecionado").show('slow').css('display', 'table');
		$("html, body").animate({ scrollTop: 0 }, "slow");
		return false;
	});

	$(document).on('click', '#pedidoSelecionado .voltar', function (e) {
		e.preventDefault();
		$("#pedidoSelecionado").hide('slow');
	});

	$(document).on('keyup', '.observacao', function () {
		$('em span').text($(this).val().length);
	});

	$(document).on('click', '#btVerificarCupom', function (e) {
		e.preventDefault();
		let idUsuario = $('body').data('idusuario');
		let cupom = $('#cupom').val().trim();
		if (cupom == '') {
			mostrarPopup('Informe o seu cupom',
				'Por favor, preencha o campo com seu cupom.');
			$('#cupom').focus();
			return
		}

		$.ajax({
			type: "post",
			url: "delivery/validarCupom.php",
			data: { cupom: cupom, idUsuario: idUsuario },
			async: false,
			cache: false,
			datatype: "text",
			beforeSend: function () { },
			success: function (data) {
				const obj = JSON.parse(data);
				if (obj.mostrar) {
					mostrarPopup('Ops! ', obj.msg);
					$('#cupom').val("");
					$('.descontoPorCupom').text(0);
					$('.resumoCupomPedido span').text('- R$ 0,00');
					$('.resumoCupomPedido').hide();
				} else {
					if (obj.descontoPorCupom > 0) {
						$('.resumoCupomPedido').show();
						$('#cupom').attr("disabled", "disabled");
					}
					$('.resumoCupomPedido span').text('- ' + parseFloat(obj.descontoPorCupom).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
					$('.descontoPorCupom').text(obj.descontoPorCupom);
					$('.tipoCupom').text(obj.tipoCupom);
				}
				atualizarResumo();
				return false
			},
			error: function () { }
		});
	});

	$(document).on('click', '.ampliarFoto', function (e) {
		var imgSrc = $(this).attr('src');
		$('.imagem-ampliada img').attr('src', imgSrc);
		$('.overlay').show();
		$('.imagem-ampliada').show();
	});

	$(document).on('click', '.overlay', function (e) {
		$('.overlay').hide();
		$('.imagem-ampliada').hide();
	});

	$(document).on('click', '.fechar', function (e) {
		$('.overlay').hide();
		$('.imagem-ampliada').hide();
	});
});

function verificarBotaoAdicionarProduto() {
	let qtdeTipos = $("#detalhesProduto .info2 .tipo").length;
	let qtde = 0;
	$("#detalhesProduto .info2 .tipo").each(function () {
		let atual = $(this);
		let minimo = atual.data('minimo');
		let maximo = atual.data('maximo');
		let opcoes = atual.find(".opcoes");
		let contador = 0;
		$(opcoes).each(function () {
			if ($(this).find("input:checkbox").is(":checked")) {
				contador += 1;
			}
			if ($(this).find("input.qtdeOpcao").val() > 0) {
				contador += parseInt($(this).find("input.qtdeOpcao").val());
			}
		});
		if (contador >= minimo) {
			qtde += 1;
			$(this).find('.topo .col2 i').show();
			$(this).find('.topo .col2 span.escolhidos').show();
			$(this).find('.topo .col2 span.obrigatorio').hide();
		} else {
			$(this).find('.topo .col2 i').hide();
			$(this).find('.topo .col2 span').show();
		}
		if (contador == maximo) {
			$(this).find('.topo .col2 span.escolhidos').hide();
		}
		$(this).find('.topo .col2 span span').text(contador);
	});
	totalProduto();
}

function totalProduto() {
	let somarAoPreco = $("#detalhesProduto .info1 .somarAoPreco").text();
	let totalOpcionais = $("#detalhesProduto .info2 .tipo").length;
	let precoProduto = parseFloat($("#detalhesProduto .info1 .preco span").text());
	let qtdeProduto = $("#detalhesProduto .info3 .qtdeProduto .qtde").val();
	let totalProduto = 0;
	if (totalOpcionais == 0) {
		totalProduto = precoProduto;
	}
	let totalBaseDeCalculo = 0;
	let totalOutros = 0;
	let calculoconf = $("body").data('calculoconf');
	$("#detalhesProduto .info2 .tipo").each(function () {
		let atual = $(this);
		let minimo = atual.data('minimo');
		let maximo = atual.data('maximo');

		let opcoes = atual.find(".opcoes");
		if (atual.data('calculo') == 's' && (calculoconf == 'm' || calculoconf == 'v')) {
			let media = 0.0;
			let maiorPreco = 0.0;
			let selecionados = 0;
			$(opcoes).each(function () {
				let preco = parseFloat($(this).find(".preco span").text());
				if ($(this).find("input:checkbox").is(":checked")) {
					media += preco;
					selecionados += 1;
					if (preco > maiorPreco) {
						maiorPreco = preco;
					}
				}
				if ($(this).find("input.qtdeOpcao").val() > 0) {
					media += parseInt($(this).find("input.qtdeOpcao").val()) * preco;
					selecionados += parseInt($(this).find("input.qtdeOpcao").val());
					if (preco > maiorPreco) {
						maiorPreco = preco;
					}
				}
			});
			if ($('body').data('calculoconf') == 'm') {
				totalBaseDeCalculo += (media / selecionados);
			} else {
				totalBaseDeCalculo = maiorPreco;
			}
		} else {
			$(opcoes).each(function () {
				let preco = parseFloat($(this).find(".preco span").text());
				if ($(this).find("input:checkbox").is(":checked")) {
					totalOutros += preco;
				}
				if ($(this).find("input.qtdeOpcao").val() > 0) {
					totalOutros += parseInt($(this).find("input.qtdeOpcao").val()) * preco;
				}
			});
		}
	});
	if (totalBaseDeCalculo > 0) {
		totalProduto = totalBaseDeCalculo + totalOutros;
		let arredondarProduto = $('body').data('arredondar');

		if (arredondarProduto == 'a' || arredondarProduto == 'd') {
			let valor = totalProduto + "";
			valor = valor.split(".");
			if (parseFloat(valor[1]) > 0) {
				if (arredondarProduto == 'a') {
					totalProduto = parseFloat(valor[0]) + 1;
				} else {
					totalProduto = parseFloat(valor[0]);
				}
			}
		}
	} else {
		if (somarAoPreco == 's') {
			totalProduto += precoProduto + totalOutros;
		} else {
			totalProduto += totalOutros;
		}
	}

	$('#detalhesProduto .info3 #precoProduto').html((totalProduto * qtdeProduto).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
	$('#detalhesProduto .info3 .precoProduto').html(totalProduto);
}

function atualizarResumo() {
	$(".resumoTaxaEntregaPedido span").text("R$ 0,00");
	let subtotal = parseFloat($('.subtotal').text());
	let descontoPorPontosFidelidade = 0;
	let taxa = 0;
	let entrega = $("input[name='entrega']:checked").val();
	if (entrega != undefined) {
		if (entrega == 'entrega') {
			if ($("#bairro option:selected").val() > 0) {
				taxa = parseFloat($("#bairro option:selected").val());
				let freteGratis = parseFloat($(".valores .freteGratisPedido").text());
				if (subtotal > freteGratis && freteGratis > 0) {
					taxa = 0;
				}
				$(".resumoTaxaEntregaPedido span").text(taxa.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
			}
		}
	}
	let item = $("input[name='pagamento']:checked");
	let taxaCartao = 0;
	let pagamento = $("input[name='pagamento']:checked").val();
	if (pagamento != undefined) {
		if (item.val().toLowerCase().indexOf('cartÃ£o de crÃ©dito#') !== -1 || item.val().toLowerCase().indexOf('cartÃ£o de dÃ©bito#') !== -1) {
			let temp = item.parents('.item').find('.taxaCartao').val();
			if (temp.toLowerCase().indexOf('p') !== -1) {
				taxaCartao = (subtotal * parseFloat(temp.toLowerCase().replace('p', ''))) / 100;
			} else {
				taxaCartao = parseFloat(temp.toLowerCase().replace('f', ''));
			}
		}
	}
	$(".resumoTaxaCartaoPedido span").text(taxaCartao.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
	$(".taxaCartaoPedido").text(taxaCartao);


	let descontoPorCupom = 0;
	if ($('.descontoPorCupom').length > 0) {
		descontoPorCupom = parseFloat($('.descontoPorCupom').text());
	}
	let total = 0;

	if ($('.trocarPontos input[type="checkbox"]').is(":checked")) {
		descontoPorPontosFidelidade = parseFloat($('.descontoPorPontosFidelidade').text());
		total = taxa + taxaCartao + (subtotal - descontoPorPontosFidelidade - descontoPorCupom);
		$(".resumoPontosPedido").show();
	} else {
		total = taxa + taxaCartao + subtotal - descontoPorCupom;
		$(".resumoPontosPedido").hide();
	}
	if (total < 0) {
		descontoPorCupom = total + descontoPorCupom;
		$('.resumoCupomPedido span').text('- ' + parseFloat(descontoPorCupom).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
		$('.descontoPorCupom').text(descontoPorCupom);
		total = 0;
	}
	$(".resumoTotalPedido span").text(total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
	$(".alert-success").remove();
	if (total <= 0) {
		$(".pagamentos").hide();
		$(".pagamentos").after('<div class="alert alert-success">ParabÃ©ns! Com a troca de pontos esse pedido vai sair totalmente GRATUITO! :)</div>');
	} else {
		$(".alert-success").remove();
		$(".pagamentos").show();
	}
}

function carrinho() {
	let idUsuario = $('body').data('idusuario');
	$.ajax({
		type: "post",
		url: "delivery/carrinho.php",
		data: "idUsuario=" + idUsuario,
		async: false,
		cache: false,
		datatype: "text",
		beforeSend: function () { },
		success: function (data) {
			$(".pedido").html(data);
		},
		error: function () { }
	});
}

function atualizar() {
	let totalPedido = $('#meuCarrinho .total').text();
	$('#carrinho .total').text(totalPedido);
	let nrItens = $('#meuCarrinho .nrItens').text();
	$('#carrinho .nrItens').text(nrItens);
}

function mostrarPopup(titulo, msg) {
	$("#modal .titulo span").text(titulo);
	$("#modal .msg").text(msg);
	$("#modal").css("display", "flex");
}

function inicio() {
	let urlLoja = $('body').data('urlloja');
	history.pushState({ page: 'inicio' }, "", "/loja/" + urlLoja);
	//$("#produto").hide('slow');
	$("#produto").hide();
	$('body').css('overflow-y', 'auto');
	atualizar();
}

function verificarLojaAberta() {
	let lojaAberta = 'n';
	let idUsuario = $('body').data('idusuario');
	$.ajax({
		type: "post",
		url: "delivery/verificarLojaAberta.php",
		data: "idUsuario=" + idUsuario,
		async: false,
		cache: false,
		datatype: "text",
		beforeSend: function () { },
		success: function (data) {
			lojaAberta = data;
		},
		error: function () { }
	});
	return lojaAberta;
}

function readJsonFile(file, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET.html", file, true);
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4 && rawFile.status == "200") {
			callback(rawFile.responseText);
		}
	}
	rawFile.send(null);
}

function removerAcentuacao(string) {
	const comAcentos = ['Ã ', 'Ã¡', 'Ã¢', 'Ã£', 'Ã¤', 'Ã¥', 'Ã§', 'Ã¨', 'Ã©', 'Ãª', 'Ã«', 'Ã¬', 'Ã­', 'Ã®', 'Ã¯', 'Ã±', 'Ã²', 'Ã³', 'Ã´', 'Ãµ', 'Ã¶', 'Ã¹', 'Ã¼', 'Ãº', 'Ã¿', 'Ã€', 'Ã', 'Ã‚', 'Ãƒ', 'Ã„', 'Ã…', 'Ã‡', 'Ãˆ', 'Ã‰', 'ÃŠ', 'Ã‹', 'ÃŒ', 'Ã', 'ÃŽ', 'Ã', 'Ã‘', 'Ã’', 'Ã“', 'Ã”', 'Ã•', 'Ã–', 'O', 'Ã™', 'Ãœ', 'Ãš'];
	const semAcentos = ['a', 'a', 'a', 'a', 'a', 'a', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'n', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'y', 'A', 'A', 'A', 'A', 'A', 'A', 'C', 'E', 'E', 'E', 'E', 'I', 'I', 'I', 'I', 'N', 'O', 'O', 'O', 'O', 'O', 'O', 'U', 'U', 'U'];

	let nova_string = string;

	for (let i = 0; i < comAcentos.length; i++) {
		nova_string = nova_string.replace(new RegExp(comAcentos[i], 'g'), semAcentos[i]);
	}

	return nova_string;
}

function copiarChavePix(item) {
	let chavePix = item.find('.chavePix').val();
	item.find('.chavePix').val(chavePix).select();
	document.execCommand("copy");
	item.find('.copiado').html('Chave Pix copiada').show(0).delay(2000).hide(0);
	setTimeout(() => {
		item.find('.copiado').html('Copiado para Ãrea de transferÃªncia').show(0).delay(2000).hide(0);
	}, 2000);
	return false
}

/*function gerarPixCopiaECola(item){

	let nomeLoja = $('.logo img').attr('title');
	let infoPix = item.find('.infoPix').val();
	console.log(infoPix);
	let taxa = $("#bairro option:selected").val();
	if (taxa == -1 || taxa == undefined) {
		taxa = 0;
	} else {
		taxa = parseFloat(taxa);
	}
	let subtotal = parseFloat($(".valores .subtotal").text());
	let descontoPorPontosFidelidade = parseFloat($(".valores .descontoPorPontosFidelidade").text());
	let descontoPorCupom = parseFloat($(".valores .descontoPorCupom").text());
	let total = subtotal + taxa - descontoPorPontosFidelidade - descontoPorCupom;
	$.ajax({
		type: "post",
		url: "delivery/gerarPixCopiaECola.php",
		data: "nomeLoja="+nomeLoja+"&infoPix=" + infoPix + "&total=" + total,
		async: false,
		cache: false,
		datatype: "text",
		beforeSend: function () { },
		success: function (data) {
			item.find('.linhaDigitavelPix').val(data).select();
			document.execCommand("copy");
			item.find('.copiado').html('Chave Pix copiada').show(0).delay(2000).hide(0);
			setTimeout(() => {
				item.find('.copiado').html('Copiado para Ãrea de transferÃªncia').show(0).delay(2000).hide(0);
			}, 2000);
			return false
		},
		error: function () {
			let msg = "Desculpe, houve um erro ao gerar o Pix copia e cola. Utilize a chave pix para efetuar o pagamento.";
			mostrarPopup('Ops! ', msg)
			return false
		}
	});
}*/

function verificarConexaoInternet() {
	return fetch('https://www.google.com/', { mode: 'no-cors' })
		.then(() => {
			return 'conectado';
		})
		.catch(() => {
			return 'desconectado';
		});
}