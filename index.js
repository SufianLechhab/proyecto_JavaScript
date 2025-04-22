/*
 * Aquest codi permet visualitzar, editar, afegir i eliminar materials, així com mostrar informació detallada en un modal.
 *
 * FUNCIONALITATS PRINCIPALS:
 * 1. Carregar materials des d'una API i mostrar-los en targetes.
 * 2. Obrir un modal amb informació detallada d'un material seleccionat.
 * 3. Editar o afegir nous materials mitjançant un formulari.
 * 4. Eliminar materials seleccionats.
 *
 * DETALLS DEL CODI:
 */

// Quan es carrega la pàgina, fem una peticio a l'API per obtenir els materials.
$(async () => {
    let res = await fetch('http://localhost:3001/materials'); // Petició GET a l'API.
    let json = await res.json(); // Convertir la resposta a JSON.
    for (let e of json) {
        console.log(e); // Mostra cada material a la consola.
        // Afegir cada material al DOM com una targeta.
        $('#elementos').append($(`
            <div class="col-md-3 mb-4 element" data-id="${e.id_num}" data-image="${e.image}" data-attributes="
                Nombre: ${e.name}
                Descripción: ${e.description}
                Ubicaciones comunes: ${e.common_locations.join(', ')}
                Efecto de cocina: ${e.cooking_effect}
                Corazones recuperados: ${e.hearts_recovered}">
                <div class="card">

                    <img src="${e.image}" class="card-img-top" alt="${e.name}">
                    <div class="card-body">

                        <h5 class="card-title">${e.name}</h5>
                        <p class="card-text">${e.description}</p>
                        <p class="card-text"><strong>Ubicacions comunes:</strong> ${e.common_locations.join(', ')}</p>
                        <p class="card-text"><strong>Efecte de cuina:</strong> ${e.cooking_effect}</p>
                        <p class="card-text"><strong>Cors recuperats:</strong> ${e.hearts_recovered}</p>
                    </div>
                </div>
            </div>
        `));
    }
});

// Quan el document està llest afegim els esdeveniments.
$(document).ready(function () {
    let selectedMaterialId = null; // Variable per emmagatzemar l'ID del material que seleccionem.

    // Obrir el modal quan es fa clic en un element.
    $('#elementos').on('click', '.element', function () {

        const imageUrl = $(this).data('image'); // Obtenir la imatge del material.
        const attributes = $(this).data('attributes'); // Obtenir els atributs del material.
        selectedMaterialId = $(this).data('id'); // Emmagatzemar l'ID del material seleccionat.

        $('#modalImage').attr('src', imageUrl); // Actualitzar la imatge del modal.
        $('#modalAttributes').text(attributes); // Actualitzar els atributs del modal.
        $('#imageModal').css('display', 'block'); // Mostrar 
    });

    // Tancar el modal qua es fa clic al boto de tancar.
    $('#closeModal').on('click', function () {

        $('#imageModal').css('display', 'none');
    });

    // Tancar el modal quan es fa clic fora del contingut del modal.
    $(window).on('click', function (event) {
        if ($(event.target).is('#imageModal')) {
            $('#imageModal').css('display', 'none');
        }
    });

    // Funcionalitat del boto d'editar.
    $('#editButton').on('click', function () {
        const materialId = selectedMaterialId;

        if (materialId) {
            // Carregar les dades existents per editar.
            const element = $(`.element[data-id="${materialId}"]`);
            const attributes = element.data('attributes').split('\n').reduce((acc, attr) => {
                const [key, value] = attr.split(':').map(s => s.trim());
                acc[key] = value;

                return acc;

            }, {});

            // Omplir el formulari amb les dades del matwrial.
            $('#materialId').val(materialId);
            $('#materialName').val(attributes.Nombre);
            $('#materialDescription').val(attributes.Descripción);
            $('#materialLocations').val(attributes['Ubicaciones comunes']);
            $('#materialEffect').val(attributes['Efecte de cuina']);
            $('#materialHearts').val(attributes['Cors recuperats']);
        } else {

            // Netejar el formulari per afegir un nou material.
            $('#materialForm')[0].reset();
            $('#materialId').val('');
        }

        $('#formModal').css('display', 'block'); // Mostrar el formulari.
    });

    // Tenquem el formulari.
    $('#closeFormModal, #cancelForm').on('click', function () {
        $('#formModal').css('display', 'none');
    });

    // Guardar les dades del formulari.
    $('#saveForm').on('click', async function () {
        const name = $('#materialName').val().trim();
        const description = $('#materialDescription').val().trim();


        // Validar els camps obligatoris.
        if (!name) {
            $('#materialName').addClass('is-invalid');
        } else {
            $('#materialName').removeClass('is-invalid');
        }

        if (!description) {
            $('#materialDescription').addClass('is-invalid');
        } else {
            $('#materialDescription').removeClass('is-invalid');
        }

        if (!name || !description) {
            return; // Aturar si falten camps que son obligatoris.
        }

        const materialData = {
            name,
            description,
            common_locations: $('#materialLocations').val().split(',').map(loc => loc.trim()),
            cooking_effect: $('#materialEffect').val(),
            hearts_recovered: parseFloat($('#materialHearts').val()) || 0,

        };

        const materialId = $('#materialId').val();
        try {
            let response;
            if (materialId) {
                // Actualitzar un material existent (PUT).
                response = await fetch(`http://localhost:3001/materials/${materialId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(materialData),
                });
            } else {
                // Afegir un nou material (POST).
                response = await fetch('http://localhost:3001/materials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(materialData),
                });
            }

            if (response.ok) {
                const updatedMaterial = await response.json();

                if (materialId) {

                    // Actualitzar l'element existent a la vista.
                    const element = $(`.element[data-id="${materialId}"]`);

                    element.data('attributes', `
                        Nombre: ${updatedMaterial.name}
                        Descripción: ${updatedMaterial.description}
                        Ubicaciones comunes: ${updatedMaterial.common_locations.join(', ')}
                        Efecte de cuina: ${updatedMaterial.cooking_effect}
                        Cors recuperats: ${updatedMaterial.hearts_recovered}
                    `);
                    element.find('.card-title').text(updatedMaterial.name);
                    element.find('.card-text').eq(0).text(updatedMaterial.description);
                    element.find('.card-text').eq(1).html(`<strong>Ubicacions comunes:</strong> ${updatedMaterial.common_locations.join(', ')}`);
                    element.find('.card-text').eq(2).html(`<strong>Efecte de cuina:</strong> ${updatedMaterial.cooking_effect}`);
                    element.find('.card-text').eq(3).html(`<strong>Cors recuperats:</strong> ${updatedMaterial.hearts_recovered}`);

                } else {

                    // Afegir un nou element a la vista.
                    $('#elementos').append($(`...`)); // Afegir el nou material.
                }

                alert('Material guardat correctament.');
                $('#formModal').css('display', 'none');
            } else {
                alert('No s\'ha pogut guardar el material.');
            }
        } catch (error) {
            console.error('Error guardant el material:', error);
            alert('S\'ha produït un error en guardar el material.');
        }
    });

    // Funcionalitat del botó d'eliminar.
    $('#deleteButton').on('click', async function () {
        if (selectedMaterialId) {
            const confirmDelete = confirm('Segur que vols eliminar-lo?');
            if (confirmDelete) {

                try {
                    const response = await fetch(`http://localhost:3001/materials/${selectedMaterialId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        alert('Eliminat.');
                        $('#imageModal').css('display', 'none');
                        $(`.element[data-id="${selectedMaterialId}"]`).remove(); // Finalment eliminar l'element del DOM.

                    } else {
                        alert('No s\'ha pogut eliminar el material.');
                    }
                    
                } catch (error) {
                    console.error('Error eliminant el material:', error);
                    alert('S\'ha produït un error en eliminar el material.');
                }
            }
        }
    });
});