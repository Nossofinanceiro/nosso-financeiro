ALTER TABLE public.receitas DROP CONSTRAINT IF EXISTS fk_receitas_categoria;
ALTER TABLE public.receitas ADD CONSTRAINT fk_receitas_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;

ALTER TABLE public.despesas DROP CONSTRAINT IF EXISTS fk_despesas_categoria;
ALTER TABLE public.despesas ADD CONSTRAINT fk_despesas_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;

ALTER TABLE public.recorrencias DROP CONSTRAINT IF EXISTS fk_recorrencias_categoria;
ALTER TABLE public.recorrencias ADD CONSTRAINT fk_recorrencias_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;

ALTER TABLE public.orcamentos DROP CONSTRAINT IF EXISTS fk_orcamentos_categoria;
ALTER TABLE public.orcamentos ADD CONSTRAINT fk_orcamentos_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE CASCADE;
