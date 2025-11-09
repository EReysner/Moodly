import { supabase } from "./supabase";
import { CATEGORIES } from "../components/activities/data";

export async function subirDatosBasicos() {
  try {
    const categoriasParaSubir = CATEGORIES.map((c) => ({
      id: c.id,
      title: c.title,
      icon: c.icon,
      tab_icon: c.tabIcon,
      color: c.color,
    }));

    const { error: errorCategorias } = await supabase
      .from("categories")
      .upsert(categoriasParaSubir);

    if (errorCategorias) throw errorCategorias;

    const actividadesParaSubir = CATEGORIES.flatMap((categoria) =>
      categoria.activities.map((actividad) => ({
        id: actividad.id,
        category_id: categoria.id,
        title: actividad.title,
        duration: actividad.duration,
        favorite: actividad.favorite,
        description: actividad.description,
        image: actividad.image,
      }))
    );

    const { error: errorActividades } = await supabase
      .from("activities")
      .upsert(actividadesParaSubir);

    if (errorActividades) throw errorActividades;

    console.log(" Datos subidos correctamente:");
    console.log(`- ${categoriasParaSubir.length} categorías`);
    console.log(`- ${actividadesParaSubir.length} actividades`);

    return true;
  } catch (error) {
    console.error(" Error al subir datos:", error);
    return false;
  }
}
